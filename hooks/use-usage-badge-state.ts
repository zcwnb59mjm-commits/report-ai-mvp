"use client";

import { useCallback, useEffect, useState } from "react";

import {
  activatePendingCheckoutSession,
  isLifetimeUnlocked,
  type UsageBadgeState,
} from "@/lib/access";
import { syncSubscriptionWithStripe } from "@/lib/access/sync-subscription-client";
import { fetchAnonymousAccessState } from "@/lib/anonymous-usage/client-access";
import { getOrCreateDeviceId } from "@/lib/device-id/device-id-storage";
import { useAuthUser } from "@/hooks/use-auth-user";
import { fetchLoggedInAccessState } from "@/lib/user-access/client-access";

export function useUsageBadgeState() {
  const { loading: authLoading, isAuthenticated } = useAuthUser();
  const [mounted, setMounted] = useState(false);
  const [usageState, setUsageState] = useState<UsageBadgeState | null>(null);
  const [canGenerate, setCanGenerate] = useState(false);

  const refreshUsageState = useCallback(async () => {
    if (isAuthenticated) {
      const access = await fetchLoggedInAccessState();

      if (access.isLoggedIn) {
        setUsageState(access.state);
        setCanGenerate(access.canGenerate);
        return;
      }
    }

    getOrCreateDeviceId();
    const access = await fetchAnonymousAccessState();

    if (access) {
      setUsageState(access.state);
      setCanGenerate(access.canGenerate);
      return;
    }

    setUsageState({ mode: "exhausted" });
    setCanGenerate(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    async function initializeUsageState() {
      getOrCreateDeviceId();

      if (!isLifetimeUnlocked()) {
        await activatePendingCheckoutSession();
        await syncSubscriptionWithStripe();
      }

      if (cancelled) return;

      await refreshUsageState();
      setMounted(true);
    }

    void initializeUsageState();

    return () => {
      cancelled = true;
    };
  }, [authLoading, refreshUsageState]);

  return { mounted, usageState, canGenerate, refreshUsageState };
}
