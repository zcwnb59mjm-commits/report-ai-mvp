const ENV_KEY = "LIFETIME_SERIAL_CODES";

export function parseLifetimeSerialCodes(value: string): string[] {
  return value
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);
}

/** 環境変数から有効なシリアルコード一覧を取得（将来は DB 取得に差し替え可能） */
export function getLifetimeSerialCodes(): string[] {
  const value = process.env[ENV_KEY];

  if (typeof value !== "string") {
    return [];
  }

  return parseLifetimeSerialCodes(value);
}
