import { NextResponse } from "next/server";

import { getAppUser } from "@/lib/auth/get-app-user";
import { mergeAnonymousUsageIntoUser } from "@/lib/anonymous-usage/server-access";
import { isValidDeviceId } from "@/lib/device-id/device-id-storage";
import { linkStripeSubscriptionToUserById } from "@/lib/user-access/link-stripe-subscription";
import { setUserLifetimeUnlocked } from "@/lib/user-access/server-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const appUser = await getAppUser();

  if (!appUser) {
    return NextResponse.json(
      { error: "ログインが必要です。" },
      { status: 401 },
    );
  }

  let body: Record<string, unknown> = {};

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const subscriptionId =
    typeof body.subscriptionId === "string" ? body.subscriptionId.trim() : "";
  const customerEmail =
    typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";
  const deviceId =
    typeof body.deviceId === "string" ? body.deviceId.trim() : "";
  const lifetimeUnlocked = body.lifetimeUnlocked === true;

  if (isValidDeviceId(deviceId)) {
    await mergeAnonymousUsageIntoUser(appUser.prismaUser.id, deviceId);
  }

  if (lifetimeUnlocked) {
    await setUserLifetimeUnlocked(appUser.prismaUser.id);
  }

  if (body.subscriptionActive === true || subscriptionId) {
    await linkStripeSubscriptionToUserById(appUser.prismaUser.id, {
      email: customerEmail || appUser.prismaUser.email,
      subscriptionId: subscriptionId || undefined,
    });
  } else {
    await linkStripeSubscriptionToUserById(appUser.prismaUser.id, {
      email: customerEmail || appUser.prismaUser.email,
    });
  }

  return NextResponse.json({ ok: true });
}
