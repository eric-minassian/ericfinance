import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

interface JwtClaims {
  sub?: string;
}
export function getUserSub(event: APIGatewayProxyEventV2): string | null {
  const claims = (event.requestContext as any)?.authorizer?.jwt?.claims as
    | JwtClaims
    | undefined;
  return claims?.sub ?? null;
}

export function json(
  statusCode: number,
  body: unknown,
  headers: Record<string, string> = {}
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  };
}
