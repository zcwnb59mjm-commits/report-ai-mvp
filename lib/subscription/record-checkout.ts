import type Stripe from "stripe";

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

/**
 * checkout.session.completed から有料状態を記録する。
 * 将来は DB 保存に差し替える。
 */
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

  return record;
}
