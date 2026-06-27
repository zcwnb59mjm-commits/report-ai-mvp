import { timingSafeEqual } from "crypto";

function serialCodesMatch(input: string, expected: string): boolean {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(inputBuffer, expectedBuffer);
}

/**
 * 入力コードが有効なシリアルコード一覧に含まれるか判定する。
 * データソース（環境変数 / DB）は呼び出し側で渡す。
 */
export function isValidSerialCode(
  input: string,
  validCodes: readonly string[],
): boolean {
  const normalizedInput = input.trim();

  if (!normalizedInput || validCodes.length === 0) {
    return false;
  }

  return validCodes.some((code) => serialCodesMatch(normalizedInput, code));
}
