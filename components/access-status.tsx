"use client";

import { SerialCodeForm } from "@/components/serial-code-form";
import { UsageBadge } from "@/components/usage-badge";
import type { UsageBadgeState } from "@/lib/access";

type AccessStatusProps = {
  mounted: boolean;
  state: UsageBadgeState | null;
  onRefresh?: () => void;
};

function isPaidAccessState(state: UsageBadgeState | null): boolean {
  return state?.mode === "lifetime" || state?.mode === "subscription";
}

export function AccessStatus({ mounted, state, onRefresh }: AccessStatusProps) {
  const showSerialCodeForm = mounted && !isPaidAccessState(state);

  return (
    <div className="space-y-4">
      <UsageBadge
        mounted={mounted}
        state={state}
        onSubscriptionRestored={onRefresh}
      />
      {showSerialCodeForm ? (
        <SerialCodeForm compact onUnlocked={onRefresh} />
      ) : null}
    </div>
  );
}
