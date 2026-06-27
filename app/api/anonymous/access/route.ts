import { NextResponse } from "next/server";

import {
  ensureAnonymousUsage,
  getAnonymousAccessState,
} from "@/lib/anonymous-usage/server-access";
import { hashClientIp } from "@/lib/anonymous-usage/ip-hash";
import { isValidDeviceId } from "@/lib/device-id/device-id-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const deviceId =
    new URL(request.url).searchParams.get("deviceId")?.trim() ?? "";

  if (!isValidDeviceId(deviceId)) {
    return NextResponse.json(
      { error: "deviceId が必要です。" },
      { status: 400 },
    );
  }

  const userAgent = request.headers.get("user-agent");
  const ipHash = hashClientIp(request);

  await ensureAnonymousUsage({
    deviceId,
    userAgent,
    ipHash,
  });

  const access = await getAnonymousAccessState(deviceId);

  return NextResponse.json(access);
}
