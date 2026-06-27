import { auth } from "@/auth";
import { USAGE_LIMIT_MESSAGE } from "@/lib/usage-limit";
import {
  ensureAnonymousUsage,
  getAnonymousAccessState,
  recordAnonymousGenerationUse,
} from "@/lib/anonymous-usage/server-access";
import { hashClientIp } from "@/lib/anonymous-usage/ip-hash";
import { isValidDeviceId } from "@/lib/device-id/device-id-storage";
import {
  getServerAccessStateForUser,
  recordServerGenerationUse,
} from "@/lib/user-access/server-access";

export type GenerationAccessResult =
  | { allowed: true; userId?: string; deviceId: string }
  | { allowed: false; error: string; status: number };

function parseDeviceId(body: Record<string, unknown>): string {
  return typeof body.deviceId === "string" ? body.deviceId.trim() : "";
}

export async function requireGenerationAccess(
  request: Request,
  body: Record<string, unknown>,
): Promise<GenerationAccessResult> {
  const deviceId = parseDeviceId(body);

  if (!isValidDeviceId(deviceId)) {
    return {
      allowed: false,
      error: "deviceId が必要です。",
      status: 400,
    };
  }

  const userAgent = request.headers.get("user-agent");
  const ipHash = hashClientIp(request);

  await ensureAnonymousUsage({
    deviceId,
    userAgent,
    ipHash,
  });

  const session = await auth();

  if (session?.user?.id) {
    const access = await getServerAccessStateForUser(session.user.id);

    if (!access.canGenerate) {
      return {
        allowed: false,
        error: USAGE_LIMIT_MESSAGE,
        status: 403,
      };
    }

    return { allowed: true, userId: session.user.id, deviceId };
  }

  const access = await getAnonymousAccessState(deviceId);

  if (!access.canGenerate) {
    return {
      allowed: false,
      error: USAGE_LIMIT_MESSAGE,
      status: 403,
    };
  }

  return { allowed: true, deviceId };
}

export async function recordGenerationAccessUse(
  userId: string | undefined,
  deviceId: string,
): Promise<void> {
  if (userId) {
    await recordServerGenerationUse(userId);
    return;
  }

  await recordAnonymousGenerationUse(deviceId);
}
