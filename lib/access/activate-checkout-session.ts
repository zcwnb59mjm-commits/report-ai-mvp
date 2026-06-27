import { setSubscriptionActive } from "./subscription-storage";

export const PENDING_CHECKOUT_SESSION_STORAGE_KEY = "pendingCheckoutSessionId";

const VERIFY_MAX_ATTEMPTS = 5;
const VERIFY_RETRY_DELAY_MS = 1500;

type VerifyResponse = {
  valid?: boolean;
  subscriptionId?: string | null;
  customerEmail?: string | null;
  retryable?: boolean;
  error?: string;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function storePendingCheckoutSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(PENDING_CHECKOUT_SESSION_STORAGE_KEY, sessionId);
}

export function getPendingCheckoutSessionId(): string | null {
  if (typeof window === "undefined") return null;

  return sessionStorage.getItem(PENDING_CHECKOUT_SESSION_STORAGE_KEY);
}

export function clearPendingCheckoutSessionId(): void {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(PENDING_CHECKOUT_SESSION_STORAGE_KEY);
}

export async function activateCheckoutSession(
  sessionId: string,
): Promise<{ success: true } | { success: false; error: string; retryable: boolean }> {
  try {
    const response = await fetch("/api/stripe/verify-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = (await response.json()) as VerifyResponse;

    if (response.ok && data.valid) {
      setSubscriptionActive({
        subscriptionId: data.subscriptionId,
        customerEmail: data.customerEmail,
      });
      clearPendingCheckoutSessionId();
      return { success: true };
    }

    const retryable = response.status === 409 || data.retryable === true;

    return {
      success: false,
      error: data.error ?? "有料プランの有効化に失敗しました。",
      retryable,
    };
  } catch {
    return {
      success: false,
      error: "有料プランの有効化に失敗しました。",
      retryable: true,
    };
  }
}

export async function activateCheckoutSessionWithRetry(
  sessionId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  storePendingCheckoutSessionId(sessionId);

  for (let attempt = 1; attempt <= VERIFY_MAX_ATTEMPTS; attempt += 1) {
    const result = await activateCheckoutSession(sessionId);

    if (result.success) {
      return result;
    }

    if (!result.retryable || attempt === VERIFY_MAX_ATTEMPTS) {
      return {
        success: false,
        error: result.error,
      };
    }

    await wait(VERIFY_RETRY_DELAY_MS);
  }

  return {
    success: false,
    error: "有料プランの有効化に失敗しました。",
  };
}

export async function activatePendingCheckoutSession(): Promise<boolean> {
  const pendingSessionId = getPendingCheckoutSessionId();

  if (!pendingSessionId) {
    return false;
  }

  const result = await activateCheckoutSessionWithRetry(pendingSessionId);
  return result.success;
}
