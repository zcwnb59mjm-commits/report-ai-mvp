import Stripe from "stripe";
import { NextResponse } from "next/server";

import { handleCheckoutSessionCompleted } from "@/lib/stripe/handle-checkout-completed";
import {
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from "@/lib/stripe/handle-subscription-lifecycle";
import {
  getStripeSecretKey,
  getStripeWebhookSecret,
} from "@/lib/stripe-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const secretKey = getStripeSecretKey();
  const webhookSecret = getStripeWebhookSecret();

  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe が設定されていません。" },
      { status: 500 },
    );
  }

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Stripe Webhook Secret が設定されていません。" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "stripe-signature ヘッダーがありません。" },
      { status: 400 },
    );
  }

  const body = await request.text();
  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);

    return NextResponse.json(
      { error: "Webhook 署名の検証に失敗しました。" },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription,
      );
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription,
      );
      break;
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
