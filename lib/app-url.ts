const APP_URL_ENV = "NEXT_PUBLIC_APP_URL";

function normalizeOrigin(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/$/, "");
  }

  return `https://${trimmed.replace(/\/$/, "")}`;
}

export function getAppOrigin(request?: Request): string {
  const configured = process.env[APP_URL_ENV];

  if (typeof configured === "string" && configured.trim()) {
    return normalizeOrigin(configured);
  }

  const vercelUrl = process.env.VERCEL_URL;

  if (typeof vercelUrl === "string" && vercelUrl.trim()) {
    return normalizeOrigin(vercelUrl);
  }

  if (request) {
    const origin = request.headers.get("origin");

    if (origin) {
      return origin.replace(/\/$/, "");
    }

    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

    if (host) {
      const protocol = request.headers.get("x-forwarded-proto") ?? "http";
      return `${protocol}://${host}`.replace(/\/$/, "");
    }
  }

  return "http://localhost:3000";
}
