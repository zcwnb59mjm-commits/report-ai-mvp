"use client";

import { useCallback, useEffect, useState } from "react";

import { getUsageBadgeState, type UsageBadgeState } from "@/lib/access";

export function useUsageBadgeState() {
  const [mounted, setMounted] = useState(false);
  const [usageState, setUsageState] = useState<UsageBadgeState | null>(null);

  const refreshUsageState = useCallback(() => {
    setUsageState(getUsageBadgeState());
  }, []);

  useEffect(() => {
    refreshUsageState();
    setMounted(true);
  }, [refreshUsageState]);

  return { mounted, usageState, refreshUsageState };
}
