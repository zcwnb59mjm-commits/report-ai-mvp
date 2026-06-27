import { createHash } from "crypto";

function getIpHashSalt(): string {
  return process.env.AUTH_SECRET ?? process.env.IP_HASH_SALT ?? "report-ai-ip-hash";
}

export function hashIpAddress(ip: string): string {
  return createHash("sha256")
    .update(`${getIpHashSalt()}:${ip}`)
    .digest("hex");
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

export function hashClientIp(request: Request): string {
  return hashIpAddress(getClientIp(request));
}
