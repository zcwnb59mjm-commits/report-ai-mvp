import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { toSubscriptionRecord } from "@/lib/subscription/record-checkout";
import { syncSubscriptionWithStripe } from "@/lib/subscription/sync-subscription";
import { createStripeClient } from "@/lib/stripe/create-stripe-client";
import { linkStripeSubscriptionToUserById } from "@/lib/user-access/link-stripe-subscription";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が正しくありません。" },
      { status: 400 },
    );
  }

  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : "";

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId が必要です。" },
      { status: 400 },
    );
  }

  const stripe = createStripeClient();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe が設定されていません。" },
      { status: 500 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.mode !== "subscription") {
      return NextResponse.json(
        { valid: false, error: "サブスクリプション決済ではありません。" },
        { status: 400 },
      );
    }

    if (session.status !== "complete") {
      return NextResponse.json(
        {
          valid: false,
          retryable: true,
          error: "決済処理が完了していません。少々お待ちください。",
        },
        { status: 409 },
      );
    }

    if (
      session.payment_status !== "paid" &&
      session.payment_status !== "no_payment_required"
    ) {
      return NextResponse.json(
        {
          valid: false,
          retryable: true,
          error: "決済確認が完了していません。少々お待ちください。",
        },
        { status: 409 },
      );
    }

    const record = toSubscriptionRecord(session);
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : null;

    if (subscriptionId) {
      const synced = await syncSubscriptionWithStripe({
        subscriptionId,
        email: record.customerEmail ?? undefined,
      });

      if (synced.valid) {
        const authSession = await auth();

        if (authSession?.user?.id) {
          await linkStripeSubscriptionToUserById(authSession.user.id, {
            email: synced.customerEmail ?? record.customerEmail,
            subscriptionId: synced.subscriptionId,
          });
        }

        return NextResponse.json(synced);
      }
    }

    const authSession = await auth();

    if (authSession?.user?.id) {
      await linkStripeSubscriptionToUserById(authSession.user.id, {
        email: record.customerEmail,
        subscriptionId,
        customerId: record.customerId,
      });
    }

    return NextResponse.json({
      valid: true,
      subscriptionId,
      customerEmail: record.customerEmail,
    });
  } catch (error) {
    console.error("Failed to verify Stripe Checkout Session:", error);

    return NextResponse.json(
      { error: "決済情報の確認に失敗しました。" },
      { status: 500 },
    );
  }
}
