import { createStripeClient } from "@/lib/stripe/create-stripe-client";
import { resolveActiveSubscription } from "@/lib/stripe/subscription-status";
import { getStripePriceId } from "@/lib/stripe-config";

export type SubscriptionSyncInput = {
  subscriptionId?: string;
  email?: string;
};

export type SubscriptionSyncResult =
  | {
      valid: true;
      subscriptionId: string;
      customerEmail: string | null;
    }
  | {
      valid: false;
      error: string;
    };

export async function syncSubscriptionWithStripe(
  input: SubscriptionSyncInput,
): Promise<SubscriptionSyncResult> {
  const stripe = createStripeClient();

  if (!stripe) {
    return {
      valid: false,
      error: "Stripe が設定されていません。",
    };
  }

  const subscriptionId = input.subscriptionId?.trim();
  const email = input.email?.trim();

  if (!subscriptionId && !email) {
    return {
      valid: false,
      error: "subscriptionId または email が必要です。",
    };
  }

  try {
    const activeSubscription = await resolveActiveSubscription(
      stripe,
      { subscriptionId, email },
      getStripePriceId(),
    );

    if (!activeSubscription) {
      return {
        valid: false,
        error: "有効なサブスクリプションが見つかりません。",
      };
    }

    return {
      valid: true,
      subscriptionId: activeSubscription.subscriptionId,
      customerEmail: activeSubscription.customerEmail,
    };
  } catch (error) {
    console.error("Failed to sync Stripe subscription:", error);

    return {
      valid: false,
      error: "サブスクリプション状態の確認に失敗しました。",
    };
  }
}
