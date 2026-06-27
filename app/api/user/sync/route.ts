import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { linkStripeSubscriptionToUserById } from "@/lib/user-access/link-stripe-subscription";
import {
  mergeAnonymousUsageIntoUser,
  setUserLifetimeUnlocked,
} from "@/lib/user-access/server-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
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
  const localUsageCount =
    typeof body.localUsageCount === "number" && Number.isFinite(body.localUsageCount)
      ? Math.max(0, Math.floor(body.localUsageCount))
      : 0;
  const lifetimeUnlocked = body.lifetimeUnlocked === true;
  const subscriptionActive = body.subscriptionActive === true;

  await mergeAnonymousUsageIntoUser(session.user.id, localUsageCount);

  if (lifetimeUnlocked) {
    await setUserLifetimeUnlocked(session.user.id);
  }

  if (body.subscriptionActive === true || subscriptionId) {
    await linkStripeSubscriptionToUserById(session.user.id, {
      email: customerEmail || session.user.email,
      subscriptionId: subscriptionId || undefined,
    });
  } else {
    await linkStripeSubscriptionToUserById(session.user.id, {
      email: customerEmail || session.user.email,
    });
  }

  return NextResponse.json({ ok: true });
}
