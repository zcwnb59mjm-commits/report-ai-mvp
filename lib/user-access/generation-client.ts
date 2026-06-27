import type { UsageBadgeState } from "@/lib/access/types";
import {
  canGenerateReport,
  getUsageBadgeState,
  recordGenerationUse,
} from "@/lib/access/generation-access";
import {
  canLoggedInUserGenerate,
  recordLoggedInGenerationUse,
} from "@/lib/user-access/client-access";

export async function canGenerateReportForCurrentUser(
  isLoggedIn: boolean,
): Promise<boolean> {
  if (isLoggedIn) {
    const canGenerate = await canLoggedInUserGenerate();
    return canGenerate ?? false;
  }

  return canGenerateReport();
}

export function getAnonymousUsageBadgeState(): UsageBadgeState {
  return getUsageBadgeState();
}

export async function recordGenerationUseForCurrentUser(
  isLoggedIn: boolean,
): Promise<void> {
  if (isLoggedIn) {
    await recordLoggedInGenerationUse();
    return;
  }

  recordGenerationUse();
}
