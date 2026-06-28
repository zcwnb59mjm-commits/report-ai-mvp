import type Stripe from "stripe";

import { createStripeClient } from "@/lib/stripe/create-stripe-client";
import { getStripePriceId } from "@/lib/stripe-config";
import { prisma } from "@/lib/prisma";

const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
]);

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<void> {
  const userId = subscription.metadata?.userId?.trim();
  const priceId = getStripePriceId();
  const isActive =
    ACTIVE_STATUSES.has(subscription.status) &&
    subscription.items.data.some((item) => item.price.id === priceId);

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionActive: isActive,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id,
      },
    });
    return;
  }

  const stripe = createStripeClient();

  if (!stripe) return;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const customer = await stripe.customers.retrieve(customerId);

  if (customer.deleted || !("email" in customer) || !customer.email) {
    return;
  }

  await prisma.user.updateMany({
    where: { email: customer.email },
    data: {
      subscriptionActive: isActive,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
    },
  });
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const userId = subscription.metadata?.userId?.trim();

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionActive: false,
        stripeSubscriptionId: null,
      },
    });
    return;
  }

  await prisma.user.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      subscriptionActive: false,
      stripeSubscriptionId: null,
    },
  });
}
