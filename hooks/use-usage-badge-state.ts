"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import {
  activatePendingCheckoutSession,
  isLifetimeUnlocked,
  type UsageBadgeState,
} from "@/lib/access";
import { syncSubscriptionWithStripe } from "@/lib/access/sync-subscription-client";
import { fetchAnonymousAccessState } from "@/lib/anonymous-usage/client-access";
import { getOrCreateDeviceId } from "@/lib/device-id/device-id-storage";
import { fetchLoggedInAccessState } from "@/lib/user-access/client-access";

export function useUsageBadgeState() {
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [usageState, setUsageState] = useState<UsageBadgeState | null>(null);
  const [canGenerate, setCanGenerate] = useState(false);

  const refreshUsageState = useCallback(async () => {
    if (status === "authenticated") {
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
  }, [status]);

  useEffect(() => {
    if (status === "loading") {
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
  }, [refreshUsageState, status]);

  return { mounted, usageState, canGenerate, refreshUsageState };
}
