import { MONTHLY_PLAN_ACTIVE_LABEL } from "@/lib/pricing";

type PaidPlanBadgeProps = {
  variant: "lifetime" | "subscription";
};

export function PaidPlanBadge({ variant }: PaidPlanBadgeProps) {
  const label =
    variant === "lifetime" ? "永久利用プラン有効" : MONTHLY_PLAN_ACTIVE_LABEL;

  return <span className="usage-badge-lifetime">{label}</span>;
}
