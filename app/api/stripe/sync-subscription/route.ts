import { NextResponse } from "next/server";

import { auth } from "@/auth";
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

  const session = await auth();
  const lookupEmail = email || session?.user?.email || undefined;

  const result = await syncSubscriptionWithStripe({
    subscriptionId: subscriptionId || undefined,
    email: lookupEmail,
  });

  if (!result.valid) {
    const status = result.error.includes("必要") ? 400 : 404;

    return NextResponse.json(result, { status });
  }

  if (session?.user?.id) {
    await linkStripeSubscriptionToUserById(session.user.id, {
      email: result.customerEmail ?? lookupEmail,
      subscriptionId: result.subscriptionId,
    });
  }

  return NextResponse.json(result);
}
