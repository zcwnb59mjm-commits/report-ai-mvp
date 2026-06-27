import type { UsageBadgeState } from "@/lib/access/types";
import { hasUnlimitedGenerationAccess } from "@/lib/access/generation-access";
import { fetchAnonymousAccessState } from "@/lib/anonymous-usage/client-access";
import { fetchLoggedInAccessState } from "@/lib/user-access/client-access";

export async function canGenerateReportForCurrentUser(
  isLoggedIn: boolean,
): Promise<boolean> {
  if (isLoggedIn) {
    const canGenerate = await fetchLoggedInAccessState();
    if (canGenerate.isLoggedIn) {
      return canGenerate.canGenerate;
    }
  }

  if (hasUnlimitedGenerationAccess()) {
    return true;
  }

  const access = await fetchAnonymousAccessState();
  return access?.canGenerate ?? false;
}

export async function recordGenerationUseForCurrentUser(
  _isLoggedIn: boolean,
): Promise<void> {
  // Usage is recorded server-side when generation APIs succeed.
}

export function getAnonymousUsageBadgeState(): UsageBadgeState {
  return { mode: "exhausted" };
}
