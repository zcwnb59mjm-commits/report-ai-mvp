export const SUBSCRIPTION_ACTIVE_STORAGE_KEY = "isSubscriptionActive";
export const STRIPE_SUBSCRIPTION_ID_STORAGE_KEY = "stripeSubscriptionId";
export const STRIPE_CUSTOMER_EMAIL_STORAGE_KEY = "stripeCustomerEmail";

const ACTIVE_VALUE = "true";

export type SubscriptionActivation = {
  subscriptionId?: string | null;
  customerEmail?: string | null;
};

export function isSubscriptionActive(): boolean {
  if (typeof window === "undefined") return false;

  return (
    localStorage.getItem(SUBSCRIPTION_ACTIVE_STORAGE_KEY) === ACTIVE_VALUE
  );
}

export function setSubscriptionActive({
  subscriptionId,
  customerEmail,
}: SubscriptionActivation = {}): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(SUBSCRIPTION_ACTIVE_STORAGE_KEY, ACTIVE_VALUE);

  if (subscriptionId) {
    localStorage.setItem(
      STRIPE_SUBSCRIPTION_ID_STORAGE_KEY,
      subscriptionId,
    );
  }

  if (customerEmail) {
    localStorage.setItem(STRIPE_CUSTOMER_EMAIL_STORAGE_KEY, customerEmail);
  }
}

export function clearSubscriptionActive(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SUBSCRIPTION_ACTIVE_STORAGE_KEY);
  localStorage.removeItem(STRIPE_SUBSCRIPTION_ID_STORAGE_KEY);
  localStorage.removeItem(STRIPE_CUSTOMER_EMAIL_STORAGE_KEY);
}

export function getStoredSubscriptionId(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(STRIPE_SUBSCRIPTION_ID_STORAGE_KEY);
}

export function getStoredCustomerEmail(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(STRIPE_CUSTOMER_EMAIL_STORAGE_KEY);
}

export function getSubscriptionSyncHints(): {
  subscriptionId: string | null;
  email: string | null;
} {
  return {
    subscriptionId: getStoredSubscriptionId(),
    email: getStoredCustomerEmail(),
  };
}
