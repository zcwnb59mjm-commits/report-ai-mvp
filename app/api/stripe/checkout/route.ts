import Stripe from "stripe";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getAppOrigin } from "@/lib/app-url";
import { getStripePriceId, getStripeSecretKey } from "@/lib/stripe-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey);
}

export async function POST(request: Request) {
  const secretKey = getStripeSecretKey();
  const priceId = getStripePriceId();

  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe が設定されていません。" },
      { status: 500 },
    );
  }

  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe Price ID が設定されていません。" },
      { status: 500 },
    );
  }

  const origin = getAppOrigin(request);
  const session = await auth();

  try {
    const stripe = getStripeClient(secretKey);
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/generate`,
      customer_email: session?.user?.email ?? undefined,
      metadata: session?.user?.id ? { userId: session.user.id } : undefined,
    });

    if (!checkoutSession.url) {
      throw new Error("Checkout session URL is missing");
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Failed to create Stripe Checkout Session:", error);

    return NextResponse.json(
      { error: "決済ページの作成に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 },
    );
  }
}
