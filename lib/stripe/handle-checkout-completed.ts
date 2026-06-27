import type Stripe from "stripe";

import { recordSubscriptionCheckout } from "@/lib/subscription/record-checkout";

/** 将来の DB 保存は recordSubscriptionCheckout 内で差し替える */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  await recordSubscriptionCheckout(session);
}
