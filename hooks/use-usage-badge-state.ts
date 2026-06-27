"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import {
  activatePendingCheckoutSession,
  getUsageBadgeState,
  isLifetimeUnlocked,
  type UsageBadgeState,
} from "@/lib/access";
import { syncSubscriptionWithStripe } from "@/lib/access/sync-subscription-client";
import {
  fetchLoggedInAccessState,
  syncLoggedInUserFromClientState,
} from "@/lib/user-access/client-access";

export function useUsageBadgeState() {
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [usageState, setUsageState] = useState<UsageBadgeState | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const refreshUsageState = useCallback(async () => {
    if (status === "authenticated") {
      const access = await fetchLoggedInAccessState();

      if (access.isLoggedIn) {
        setIsLoggedIn(true);
        setUsageState(access.state);
        return;
      }
    }

    setIsLoggedIn(false);
    setUsageState(getUsageBadgeState());
  }, [status]);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    let cancelled = false;

    async function initializeUsageState() {
      if (status === "authenticated") {
        try {
          await syncLoggedInUserFromClientState();
        } catch {
          // DB unavailable; fall back to client-side state below.
        }
      } else if (!isLifetimeUnlocked()) {
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

  return { mounted, usageState, refreshUsageState, isLoggedIn };
}
