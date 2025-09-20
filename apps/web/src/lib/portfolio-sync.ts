import {
  decryptDatabase,
  encryptDatabase,
  isEncryptedDatabase,
} from "@/lib/crypto";
import { fetchAuthSession } from "aws-amplify/auth";

// Types for API responses
export interface DownloadResponse {
  exists: boolean;
  presignedUrl?: string;
  versionId?: string;
  eTag?: string;
  sizeBytes?: number;
  lastModified?: string;
  metadata?: Record<string, string>;
}

export interface UploadInitResponse {
  presignedUrl: string;
  key: string;
  currentVersionId?: string;
  versioningBasis: string;
  uploadHeaders: Record<string, string>;
}

export interface SyncState {
  remoteVersionId: string | null;
  remoteETag: string | null;
  lastSyncAt: Date | null;
}

export class PortfolioSyncClient {
  private apiBase: string;
  private state: SyncState = {
    remoteVersionId: null,
    remoteETag: null,
    lastSyncAt: null,
  };

  constructor(apiBase: string) {
    this.apiBase = apiBase.replace(/\/$/, "");
  }

  getState() {
    return this.state;
  }

  private async authHeader(): Promise<Record<string, string>> {
    const session = await fetchAuthSession();
    const token =
      session.tokens?.idToken?.toString() ||
      session.tokens?.accessToken?.toString();
    if (!token) throw new Error("No auth token");
    return { Authorization: `Bearer ${token}` };
  }

  async checkRemote(): Promise<DownloadResponse> {
    const res = await fetch(`${this.apiBase}/portfolio/presign/download`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(await this.authHeader()),
      },
      body: "{}",
    });
    if (!res.ok) throw new Error(`Download presign failed: ${res.status}`);
    const json: DownloadResponse = await res.json();
    if (json.exists) {
      this.state.remoteVersionId = json.versionId || null;
      this.state.remoteETag = json.eTag || null;
    }
    return json;
  }

  async downloadAndDecrypt(password: string): Promise<Uint8Array | null> {
    const info = await this.checkRemote();
    if (!info.exists || !info.presignedUrl) return null;
    const blobRes = await fetch(info.presignedUrl);
    if (!blobRes.ok) throw new Error("Failed to fetch remote portfolio");
    const arrayBuf = await blobRes.arrayBuffer();
    const data = new Uint8Array(arrayBuf);
    if (!isEncryptedDatabase(data))
      throw new Error("Remote blob not encrypted format");
    const decrypted = await decryptDatabase(data, password);
    this.state.lastSyncAt = new Date();
    return decrypted;
  }

  async uploadEncrypted(
    encryptedBytes: Uint8Array,
    opts: {
      expectedVersionId?: string | null;
      formatVersion?: string;
      cipher?: string;
    }
  ) {
    const initRes = await fetch(`${this.apiBase}/portfolio/presign/upload`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(await this.authHeader()),
      },
      body: JSON.stringify({
        expectedVersionId: opts.expectedVersionId ?? this.state.remoteVersionId,
        contentLength: encryptedBytes.byteLength,
        formatVersion: opts.formatVersion ?? "1",
        cipher: opts.cipher ?? "aes-gcm",
      }),
    });
    if (initRes.status === 409) {
      const conflict = await initRes.json();
      throw Object.assign(new Error("Version conflict"), { conflict });
    }
    if (!initRes.ok)
      throw new Error(`Upload presign failed: ${initRes.status}`);
    const presign: UploadInitResponse = await initRes.json();

    // Provide ArrayBuffer body for broader BodyInit compatibility in strict envs
    const putArrayBuffer = encryptedBytes.buffer.slice(
      encryptedBytes.byteOffset,
      encryptedBytes.byteOffset + encryptedBytes.byteLength
    ) as ArrayBuffer;
    const putBody = new Blob([putArrayBuffer], {
      type: "application/octet-stream",
    });
    const put = await fetch(presign.presignedUrl, {
      method: "PUT",
      headers: presign.uploadHeaders,
      body: putBody,
    });
    if (!put.ok) throw new Error(`Upload failed: ${put.status}`);
    // We won't know new versionId until next head - trigger refresh on next sync
    this.state.lastSyncAt = new Date();
    return presign;
  }
}

// Convenience function: encrypt and upload current DB bytes
export async function uploadLocalDatabase(
  dbBytes: Uint8Array,
  password: string,
  client: PortfolioSyncClient
) {
  const encrypted = await encryptDatabase(dbBytes, password);
  return client.uploadEncrypted(encrypted, {
    expectedVersionId: client.getState().remoteVersionId,
  });
}
