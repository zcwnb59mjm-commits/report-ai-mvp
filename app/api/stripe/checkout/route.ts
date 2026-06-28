import Stripe from "stripe";
import { NextResponse } from "next/server";

import { getAppUser } from "@/lib/auth/get-app-user";
import { getAppOrigin } from "@/lib/app-url";
import { getStripePriceId, getStripeSecretKey } from "@/lib/stripe-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey);
}

export async function POST(request: Request) {
  const appUser = await getAppUser();

  if (!appUser) {
    return NextResponse.json(
      { error: "有料プランのご利用にはログインが必要です。" },
      { status: 401 },
    );
  }

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

  try {
    const stripe = getStripeClient(secretKey);
    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/generate`,
      client_reference_id: appUser.prismaUser.id,
      metadata: {
        userId: appUser.prismaUser.id,
        supabaseUserId: appUser.supabaseUser.id,
      },
      subscription_data: {
        metadata: {
          userId: appUser.prismaUser.id,
        },
      },
    };

    if (appUser.prismaUser.stripeCustomerId) {
      checkoutParams.customer = appUser.prismaUser.stripeCustomerId;
    } else {
      checkoutParams.customer_email = appUser.prismaUser.email;
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);

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
