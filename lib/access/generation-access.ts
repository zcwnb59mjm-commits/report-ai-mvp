import { getLocalAccessGrants } from "./lifetime-storage";
import type { AccessEntitlement, UsageBadgeState } from "./types";
import {
  canUseFreeGeneration,
  getRemainingUses,
  incrementUsageCount,
} from "@/lib/usage-limit";

function hasEntitlement(entitlement: AccessEntitlement): boolean {
  return getLocalAccessGrants().some((grant) =>
    grant.entitlements.includes(entitlement),
  );
}

export function hasUnlimitedGenerationAccess(): boolean {
  return hasEntitlement("unlimited-generation");
}

export function canGenerateReport(): boolean {
  return hasUnlimitedGenerationAccess() || canUseFreeGeneration();
}

export function recordGenerationUse(): void {
  if (hasUnlimitedGenerationAccess()) return;

  incrementUsageCount();
}

export function getUsageBadgeState(): UsageBadgeState {
  if (hasUnlimitedGenerationAccess()) {
    return { mode: "lifetime" };
  }

  const remaining = getRemainingUses();

  if (remaining === 0) {
    return { mode: "exhausted" };
  }

  return { mode: "free", remaining };
}
