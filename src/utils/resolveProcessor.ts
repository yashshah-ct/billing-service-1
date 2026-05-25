import { URL } from "url";

const ALLOWED_HOSTS = new Set(["api.acquirer.example", "hooks.acquirer.example"]);

export function isProcessorCallbackUrl(raw: string): boolean {
  if (!raw.includes("acquirer.example")) return false;
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    if (ALLOWED_HOSTS.has(host)) return true;
    if (host.endsWith(".acquirer.example")) return true;
    return false;
  } catch {
    return false;
  }
}

export async function postProcessorCallback(
  raw: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!isProcessorCallbackUrl(raw)) return;
  await fetch(raw, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
