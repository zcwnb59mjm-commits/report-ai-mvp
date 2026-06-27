import type Stripe from "stripe";

const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>(["active", "trialing"]);

export type ActiveSubscriptionInfo = {
  subscriptionId: string;
  customerEmail: string | null;
  customerId: string | null;
};

function subscriptionMatchesPrice(
  subscription: Stripe.Subscription,
  priceId?: string,
): boolean {
  if (!priceId) {
    return true;
  }

  return subscription.items.data.some((item) => item.price.id === priceId);
}

export function isActiveSubscription(
  subscription: Stripe.Subscription,
  priceId?: string,
): boolean {
  return (
    ACTIVE_STATUSES.has(subscription.status) &&
    subscriptionMatchesPrice(subscription, priceId)
  );
}

async function getCustomerEmail(
  stripe: Stripe,
  customerId: string,
  fallbackEmail?: string,
): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);

    if ("deleted" in customer && customer.deleted) {
      return fallbackEmail ?? null;
    }

    return customer.email ?? fallbackEmail ?? null;
  } catch {
    return fallbackEmail ?? null;
  }
}

export async function findActiveSubscriptionById(
  stripe: Stripe,
  subscriptionId: string,
  priceId?: string,
): Promise<ActiveSubscriptionInfo | null> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  if (!isActiveSubscription(subscription, priceId)) {
    return null;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const customerEmail = await getCustomerEmail(stripe, customerId);

  return {
    subscriptionId: subscription.id,
    customerEmail,
    customerId,
  };
}

export async function findActiveSubscriptionByEmail(
  stripe: Stripe,
  email: string,
  priceId?: string,
): Promise<ActiveSubscriptionInfo | null> {
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length === 0) {
    return null;
  }

  const customer = customers.data[0];
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
    status: "all",
    limit: 20,
  });

  const activeSubscription = subscriptions.data.find((subscription) =>
    isActiveSubscription(subscription, priceId),
  );

  if (!activeSubscription) {
    return null;
  }

  return {
    subscriptionId: activeSubscription.id,
    customerEmail: customer.email ?? email,
    customerId: customer.id,
  };
}

export async function resolveActiveSubscription(
  stripe: Stripe,
  options: {
    subscriptionId?: string;
    email?: string;
  },
  priceId?: string,
): Promise<ActiveSubscriptionInfo | null> {
  const subscriptionId = options.subscriptionId?.trim();
  const email = options.email?.trim();

  if (subscriptionId) {
    const byId = await findActiveSubscriptionById(
      stripe,
      subscriptionId,
      priceId,
    );

    if (byId) {
      return byId;
    }
  }

  if (email) {
    return findActiveSubscriptionByEmail(stripe, email, priceId);
  }

  return null;
}
