import { NextResponse } from "next/server";

import { getLifetimeSerialCode } from "@/lib/lifetime-serial-code";
import { verifySerialCode } from "@/lib/verify-serial-code";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const INVALID_SERIAL_MESSAGE = "シリアルコードが正しくありません";

export async function POST(request: Request) {
  const configuredCode = getLifetimeSerialCode();

  if (!configuredCode) {
    return NextResponse.json(
      { valid: false, error: "シリアルコード認証が設定されていません。" },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { valid: false, error: "リクエスト形式が正しくありません。" },
      { status: 400 },
    );
  }

  const serialCode =
    typeof body.serialCode === "string" ? body.serialCode.trim() : "";

  if (!serialCode) {
    return NextResponse.json(
      { valid: false, error: "シリアルコードを入力してください。" },
      { status: 400 },
    );
  }

  const valid = verifySerialCode(serialCode, configuredCode);

  if (!valid) {
    return NextResponse.json(
      { valid: false, error: INVALID_SERIAL_MESSAGE },
      { status: 401 },
    );
  }

  return NextResponse.json({ valid: true });
}
