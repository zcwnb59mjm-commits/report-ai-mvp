import { isLifetimeUnlocked } from "./lifetime-storage";
import {
  clearSubscriptionActive,
  getSubscriptionSyncHints,
  setSubscriptionActive,
} from "./subscription-storage";
import { getOrCreateDeviceId } from "@/lib/device-id/device-id-storage";

type SyncResponse = {
  valid?: boolean;
  subscriptionId?: string;
  customerEmail?: string | null;
  error?: string;
};

export async function syncSubscriptionWithStripe(): Promise<boolean> {
  if (isLifetimeUnlocked()) {
    return false;
  }

  const { subscriptionId, email } = getSubscriptionSyncHints();

  if (!subscriptionId && !email) {
    return false;
  }

  try {
    const response = await fetch("/api/stripe/sync-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriptionId: subscriptionId ?? undefined,
        email: email ?? undefined,
        deviceId: getOrCreateDeviceId(),
      }),
    });

    const data = (await response.json()) as SyncResponse;

    if (response.ok && data.valid && data.subscriptionId) {
      setSubscriptionActive({
        subscriptionId: data.subscriptionId,
        customerEmail: data.customerEmail,
      });
      return true;
    }

    if (response.status === 404 && (subscriptionId || email)) {
      clearSubscriptionActive();
    }

    return false;
  } catch {
    return false;
  }
}

export async function restoreSubscriptionByEmail(
  email: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const response = await fetch("/api/stripe/sync-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, deviceId: getOrCreateDeviceId() }),
    });

    const data = (await response.json()) as SyncResponse;

    if (!response.ok || !data.valid || !data.subscriptionId) {
      return {
        success: false,
        error: data.error ?? "有効なサブスクリプションが見つかりません。",
      };
    }

    setSubscriptionActive({
      subscriptionId: data.subscriptionId,
      customerEmail: data.customerEmail ?? email,
    });

    return { success: true };
  } catch {
    return {
      success: false,
      error: "サブスクリプションの復元に失敗しました。",
    };
  }
}
