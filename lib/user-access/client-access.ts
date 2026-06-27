import { auth } from "@/auth";
import { isLifetimeUnlocked } from "@/lib/access/lifetime-storage";
import {
  getStoredCustomerEmail,
  getStoredSubscriptionId,
  isSubscriptionActive,
} from "@/lib/access/subscription-storage";
import { getUsageCount } from "@/lib/usage-limit";

export async function syncLoggedInUserFromClientState(): Promise<void> {
  const response = await fetch("/api/user/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      localUsageCount: getUsageCount(),
      lifetimeUnlocked: isLifetimeUnlocked(),
      subscriptionId: getStoredSubscriptionId(),
      customerEmail: getStoredCustomerEmail(),
      subscriptionActive: isSubscriptionActive(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to sync user state");
  }
}

export async function fetchLoggedInAccessState(): Promise<{
  isLoggedIn: true;
  canGenerate: boolean;
  state: import("@/lib/access/types").UsageBadgeState;
} | { isLoggedIn: false }> {
  const response = await fetch("/api/user/access");
  const data = (await response.json()) as {
    isLoggedIn?: boolean;
    canGenerate?: boolean;
    state?: import("@/lib/access/types").UsageBadgeState;
  };

  if (!data.isLoggedIn || !data.state) {
    return { isLoggedIn: false };
  }

  return {
    isLoggedIn: true,
    canGenerate: data.canGenerate ?? false,
    state: data.state,
  };
}

export async function recordLoggedInGenerationUse(): Promise<void> {
  const sessionResponse = await fetch("/api/user/access");

  if (!sessionResponse.ok) {
    return;
  }

  const sessionData = (await sessionResponse.json()) as { isLoggedIn?: boolean };

  if (!sessionData.isLoggedIn) {
    return;
  }

  await fetch("/api/user/record-usage", { method: "POST" });
}

export async function canLoggedInUserGenerate(): Promise<boolean | null> {
  const access = await fetchLoggedInAccessState();

  if (!access.isLoggedIn) {
    return null;
  }

  return access.canGenerate;
}

export async function getLoggedInUserEmail(): Promise<string | null> {
  const response = await fetch("/api/user/access");

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    isLoggedIn?: boolean;
    user?: { email?: string | null };
  };

  return data.isLoggedIn ? (data.user?.email ?? null) : null;
}
