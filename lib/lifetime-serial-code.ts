const ENV_KEY = "LIFETIME_SERIAL_CODE";

export function getLifetimeSerialCode(): string | undefined {
  const value = process.env[ENV_KEY];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
