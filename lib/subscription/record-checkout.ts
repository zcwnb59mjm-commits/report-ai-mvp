import type Stripe from "stripe";

import { linkStripeSubscriptionFromCheckoutEmail } from "@/lib/user-access/link-stripe-subscription";

export type SubscriptionRecord = {
  customerId: string | null;
  customerEmail: string | null;
  subscriptionId: string | null;
  paymentStatus: string | null;
  checkoutSessionId: string;
  activatedAt: string;
};

export function toSubscriptionRecord(
  session: Stripe.Checkout.Session,
): SubscriptionRecord {
  return {
    customerId:
      typeof session.customer === "string" ? session.customer : null,
    customerEmail: session.customer_email ?? session.customer_details?.email ?? null,
    subscriptionId:
      typeof session.subscription === "string" ? session.subscription : null,
    paymentStatus: session.payment_status ?? null,
    checkoutSessionId: session.id,
    activatedAt: new Date().toISOString(),
  };
}

function isPaidSubscriptionCheckout(session: Stripe.Checkout.Session): boolean {
  return (
    session.mode === "subscription" &&
    session.payment_status === "paid"
  );
}

export async function recordSubscriptionCheckout(
  session: Stripe.Checkout.Session,
): Promise<SubscriptionRecord | null> {
  const record = toSubscriptionRecord(session);

  console.log("Stripe checkout.session.completed:", record);

  if (!isPaidSubscriptionCheckout(session)) {
    console.warn(
      "Skipping subscription activation: checkout session is not a paid subscription.",
      {
        mode: session.mode,
        payment_status: session.payment_status,
      },
    );
    return null;
  }

  await linkStripeSubscriptionFromCheckoutEmail(record.customerEmail, {
    subscriptionId: record.subscriptionId,
    customerId: record.customerId,
  });

  return record;
}
