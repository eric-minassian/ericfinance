import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

const s3 = new S3Client({});
const BUCKET_NAME = process.env.BUCKET_NAME!;
const MAX_OBJECT_SIZE = parseInt(process.env.MAX_OBJECT_SIZE || "26214400", 10); // default 25MB

interface UploadRequestBody {
  expectedVersionId?: string | null;
  expectedETag?: string;
  contentLength: number;
  formatVersion?: string;
  cipher?: string;
}

function json(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

function getUserSub(event: APIGatewayProxyEventV2): string | null {
  // JWT authorizer injects claims in requestContext.authorizer.jwt.claims
  const claims: any = (event.requestContext as any)?.authorizer?.jwt?.claims;
  return claims?.sub || null;
}

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const userSub = getUserSub(event);
    if (!userSub) return json(401, { message: "Unauthorized" });

    const route = event.rawPath; // e.g., /portfolio/presign/download

    if (route.endsWith("/download")) {
      const key = `portfolios/${userSub}/portfolio.enc`;
      try {
        const head = await s3.send(
          new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key })
        );
        const versionId = (head as any).VersionId as string | undefined; // SDK typing
        const presignedUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
          { expiresIn: 60 }
        );
        return json(200, {
          exists: true,
          presignedUrl,
          versionId,
          eTag: head.ETag?.replace(/"/g, ""),
          sizeBytes: head.ContentLength,
          lastModified: head.LastModified?.toISOString(),
          metadata: head.Metadata || {},
        });
      } catch (err: any) {
        if (err?.$metadata?.httpStatusCode === 404) {
          return json(200, { exists: false });
        }
        throw err;
      }
    } else if (route.endsWith("/upload")) {
      if (!event.body) return json(400, { message: "Missing body" });
      let parsed: UploadRequestBody;
      try {
        parsed = JSON.parse(event.body);
      } catch {
        return json(400, { message: "Invalid JSON" });
      }
      const {
        expectedVersionId,
        expectedETag,
        contentLength,
        formatVersion,
        cipher,
      } = parsed;
      if (typeof contentLength !== "number" || contentLength <= 0) {
        return json(400, { message: "contentLength required" });
      }
      if (contentLength > MAX_OBJECT_SIZE) {
        return json(413, { message: "Object too large" });
      }
      const key = `portfolios/${userSub}/portfolio.enc`;

      // Determine current version (if any) for optimistic concurrency
      let currentVersionId: string | null = null;
      let currentETag: string | null = null;
      try {
        const head = await s3.send(
          new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key })
        );
        currentVersionId = (head as any).VersionId || null;
        currentETag = head.ETag ? head.ETag.replace(/"/g, "") : null;
      } catch (err: any) {
        if (err?.$metadata?.httpStatusCode !== 404) throw err;
      }

      if (currentVersionId) {
        if (expectedVersionId && expectedVersionId !== currentVersionId) {
          return json(409, {
            message: "Version conflict",
            currentVersionId,
            currentETag,
          });
        }
        if (expectedETag && expectedETag !== currentETag) {
          return json(409, {
            message: "ETag conflict",
            currentVersionId,
            currentETag,
          });
        }
      } else if (expectedVersionId) {
        // Client expected something but nothing exists
        return json(409, {
          message: "No existing object; cannot match expectedVersionId",
        });
      }

      const metadata: Record<string, string> = {};
      if (formatVersion) metadata["format-version"] = String(formatVersion);
      if (cipher) metadata["cipher"] = String(cipher);
      metadata["updated-at"] = new Date().toISOString();
      if (currentVersionId) metadata["prev-version"] = currentVersionId;

      // We cannot embed cond checks in pre-signed URL for version, so issue directly
      // (small race window acknowledged in design)
      const presignedUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          ContentType: "application/octet-stream",
          Metadata: metadata,
        }),
        { expiresIn: 60 }
      );

      return json(200, {
        presignedUrl,
        key,
        currentVersionId,
        versioningBasis: currentVersionId ? "versionId" : "none",
        uploadHeaders: {
          "content-type": "application/octet-stream",
          // Metadata headers user must include on PUT
          ...Object.fromEntries(
            Object.entries(metadata).map(([k, v]) => [`x-amz-meta-${k}`, v])
          ),
        },
      });
    }

    return json(404, { message: "Not found" });
  } catch (error: any) {
    console.error("Error handling request", error);
    return json(500, { message: "Internal Server Error" });
  }
};
