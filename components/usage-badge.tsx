import { USAGE_LIMIT_MESSAGE } from "@/lib/usage-limit";

type UsageBadgeProps = {
  remaining: number | null;
};

export function UsageBadge({ remaining }: UsageBadgeProps) {
  if (remaining === null) return null;

  if (remaining === 0) {
    return (
      <div className="space-y-4">
        <span className="usage-badge-exhausted">無料利用 0 回</span>
        <p className="alert-message">{USAGE_LIMIT_MESSAGE}</p>
      </div>
    );
  }

  return (
    <span className="usage-badge">
      <span className="usage-badge-dot" aria-hidden="true" />
      無料利用 残り {remaining} 回
    </span>
  );
}
