import { createStripeClient } from "@/lib/stripe/create-stripe-client";
import { resolveActiveSubscription } from "@/lib/stripe/subscription-status";
import { getStripePriceId } from "@/lib/stripe-config";
import { prisma } from "@/lib/prisma";

export async function linkStripeSubscriptionToUserByEmail(
  email: string,
): Promise<void> {
  const stripe = createStripeClient();

  if (!stripe) {
    return;
  }

  const activeSubscription = await resolveActiveSubscription(
    stripe,
    { email },
    getStripePriceId(),
  );

  if (!activeSubscription) {
    return;
  }

  await prisma.user.updateMany({
    where: { email },
    data: {
      subscriptionActive: true,
      stripeSubscriptionId: activeSubscription.subscriptionId,
      stripeCustomerId: activeSubscription.customerId,
    },
  });
}

export async function linkStripeSubscriptionToUserById(
  userId: string,
  options: {
    email?: string | null;
    subscriptionId?: string | null;
    customerId?: string | null;
  },
): Promise<void> {
  const stripe = createStripeClient();
  const email = options.email?.trim();
  const subscriptionId = options.subscriptionId?.trim();

  if (stripe && (subscriptionId || email)) {
    const activeSubscription = await resolveActiveSubscription(
      stripe,
      {
        subscriptionId: subscriptionId ?? undefined,
        email: email ?? undefined,
      },
      getStripePriceId(),
    );

    if (activeSubscription) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionActive: true,
          stripeSubscriptionId: activeSubscription.subscriptionId,
          stripeCustomerId: activeSubscription.customerId,
        },
      });
      return;
    }
  }

  if (subscriptionId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionActive: true,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: options.customerId ?? undefined,
      },
    });
  }
}

export async function linkStripeSubscriptionFromCheckoutEmail(
  email: string | null | undefined,
  options: {
    subscriptionId?: string | null;
    customerId?: string | null;
  },
): Promise<void> {
  if (!email) {
    return;
  }

  await linkStripeSubscriptionToUserByEmail(email);

  if (options.subscriptionId) {
    await prisma.user.updateMany({
      where: { email },
      data: {
        subscriptionActive: true,
        stripeSubscriptionId: options.subscriptionId,
        stripeCustomerId: options.customerId ?? undefined,
      },
    });
  }
}
