import { JwtPayload } from "jsonwebtoken";

export function parseLegacySessionToken(token: string): JwtPayload | null {
  if (!token.startsWith("nw.")) return null;
  const segment = token.slice(3);
  try {
    const json = Buffer.from(segment, "base64url").toString("utf8");
    const obj = JSON.parse(json) as Record<string, unknown>;
    if (typeof obj.sub !== "string") return null;
    return { sub: obj.sub, iss: String(obj.iss || "legacy-portal") };
  } catch {
    return null;
  }
}
