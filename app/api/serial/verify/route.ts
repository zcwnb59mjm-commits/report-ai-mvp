import { NextResponse } from "next/server";

import { getAppUser } from "@/lib/auth/get-app-user";
import { setAnonymousLifetimeUnlocked } from "@/lib/anonymous-usage/server-access";
import { isValidDeviceId } from "@/lib/device-id/device-id-storage";
import { getLifetimeSerialCodes } from "@/lib/lifetime-serial-code";
import { setUserLifetimeUnlocked } from "@/lib/user-access/server-access";
import { isValidSerialCode } from "@/lib/verify-serial-code";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const INVALID_SERIAL_MESSAGE = "シリアルコードが正しくありません";

export async function POST(request: Request) {
  const validCodes = getLifetimeSerialCodes();

  if (validCodes.length === 0) {
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
  const deviceId =
    typeof body.deviceId === "string" ? body.deviceId.trim() : "";

  if (!serialCode) {
    return NextResponse.json(
      { valid: false, error: "シリアルコードを入力してください。" },
      { status: 400 },
    );
  }

  const valid = isValidSerialCode(serialCode, validCodes);

  if (!valid) {
    return NextResponse.json(
      { valid: false, error: INVALID_SERIAL_MESSAGE },
      { status: 401 },
    );
  }

  const appUser = await getAppUser();

  if (appUser) {
    await setUserLifetimeUnlocked(appUser.prismaUser.id);
  }

  if (isValidDeviceId(deviceId)) {
    await setAnonymousLifetimeUnlocked(deviceId);
  }

  return NextResponse.json({ valid: true });
}
