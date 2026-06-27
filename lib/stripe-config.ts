const SECRET_KEY_ENV = "STRIPE_SECRET_KEY";
const PRICE_ID_ENV = "STRIPE_PRICE_ID";

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
