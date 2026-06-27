"use client";

import { useCallback, useEffect, useState } from "react";

import { activatePendingCheckoutSession } from "@/lib/access/activate-checkout-session";
import {
  getUsageBadgeState,
  isLifetimeUnlocked,
  type UsageBadgeState,
} from "@/lib/access";
import { syncSubscriptionWithStripe } from "@/lib/access/sync-subscription-client";

export function useUsageBadgeState() {
  const [mounted, setMounted] = useState(false);
  const [usageState, setUsageState] = useState<UsageBadgeState | null>(null);

  const refreshUsageState = useCallback(() => {
    setUsageState(getUsageBadgeState());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initializeUsageState() {
      if (!isLifetimeUnlocked()) {
        await activatePendingCheckoutSession();
        await syncSubscriptionWithStripe();
      }

      if (cancelled) return;

      refreshUsageState();
      setMounted(true);
    }

    void initializeUsageState();

    return () => {
      cancelled = true;
    };
  }, [refreshUsageState]);

  return { mounted, usageState, refreshUsageState };
}
