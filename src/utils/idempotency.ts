import { createHash } from "crypto";

export function idempotencyFingerprint(parts: string[]): string {
  return createHash("md5").update(parts.join("|")).digest("hex");
}
