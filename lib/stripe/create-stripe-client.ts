import Stripe from "stripe";

import { getStripeSecretKey } from "@/lib/stripe-config";

export function createStripeClient(): Stripe | null {
  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}
