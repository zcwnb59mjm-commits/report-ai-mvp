import { NextResponse } from "next/server";

import { getAppUser } from "@/lib/auth/get-app-user";
import { setAnonymousSubscriptionActive } from "@/lib/anonymous-usage/server-access";
import { isValidDeviceId } from "@/lib/device-id/device-id-storage";
import { syncSubscriptionWithStripe } from "@/lib/subscription/sync-subscription";
import { linkStripeSubscriptionToUserById } from "@/lib/user-access/link-stripe-subscription";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { valid: false, error: "リクエスト形式が正しくありません。" },
      { status: 400 },
    );
  }

  const subscriptionId =
    typeof body.subscriptionId === "string" ? body.subscriptionId.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const deviceId =
    typeof body.deviceId === "string" ? body.deviceId.trim() : "";

  const appUser = await getAppUser();
  const lookupEmail = email || appUser?.prismaUser.email || undefined;

  const result = await syncSubscriptionWithStripe({
    subscriptionId: subscriptionId || undefined,
    email: lookupEmail,
  });

  if (!result.valid) {
    if (isValidDeviceId(deviceId)) {
      await setAnonymousSubscriptionActive(deviceId, false);
    }

    const status = result.error.includes("必要") ? 400 : 404;

    return NextResponse.json(result, { status });
  }

  if (appUser) {
    await linkStripeSubscriptionToUserById(appUser.prismaUser.id, {
      email: result.customerEmail ?? lookupEmail,
      subscriptionId: result.subscriptionId,
    });
  }

  if (isValidDeviceId(deviceId)) {
    await setAnonymousSubscriptionActive(deviceId, true);
  }

  return NextResponse.json(result);
}
