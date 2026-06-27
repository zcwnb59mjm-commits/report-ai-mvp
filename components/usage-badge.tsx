import { SubscribeButton } from "@/components/subscribe-button";
import { RestoreSubscriptionForm } from "@/components/restore-subscription-form";
import { USAGE_LIMIT_MESSAGE } from "@/lib/usage-limit";

import type { UsageBadgeState } from "@/lib/access";

type UsageBadgeProps = {
  mounted: boolean;
  state: UsageBadgeState | null;
  onSubscriptionRestored?: () => void;
};

function UsageBadgePlaceholder() {
  return (
    <span
      className="inline-block h-[36px] w-[168px] rounded-full bg-neutral-100"
      aria-hidden="true"
    />
  );
}

export function UsageBadge({
  mounted,
  state,
  onSubscriptionRestored,
}: UsageBadgeProps) {
  if (!mounted) {
    return <UsageBadgePlaceholder />;
  }

  if (state === null) return null;

  if (state.mode === "lifetime") {
    return <span className="usage-badge-lifetime">永久利用プラン有効</span>;
  }

  if (state.mode === "subscription") {
    return <span className="usage-badge-lifetime">月980円プラン有効</span>;
  }

  if (state.mode === "exhausted") {
    return (
      <div className="space-y-4">
        <span className="usage-badge-exhausted">無料利用 0 回</span>
        <p className="alert-message">{USAGE_LIMIT_MESSAGE}</p>
        <SubscribeButton />
        <RestoreSubscriptionForm
          compact
          onRestored={onSubscriptionRestored}
        />
      </div>
    );
  }

  return (
    <span className="usage-badge">
      <span className="usage-badge-dot" aria-hidden="true" />
      無料利用 残り {state.remaining} 回
    </span>
  );
}
