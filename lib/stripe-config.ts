const SECRET_KEY_ENV = "STRIPE_SECRET_KEY";
const PRICE_ID_ENV = "STRIPE_PRICE_ID";
const WEBHOOK_SECRET_ENV = "STRIPE_WEBHOOK_SECRET";

export function getStripeSecretKey(): string | undefined {
  const value = process.env[SECRET_KEY_ENV];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getStripePriceId(): string | undefined {
  const value = process.env[PRICE_ID_ENV];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getStripeWebhookSecret(): string | undefined {
  const value = process.env[WEBHOOK_SECRET_ENV];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
