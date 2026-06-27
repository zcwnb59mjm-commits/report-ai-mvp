import type { UsageBadgeState } from "@/lib/access/types";
import { getOrCreateDeviceId } from "@/lib/device-id/device-id-storage";

export type AnonymousAccessResponse = {
  canGenerate?: boolean;
  state?: UsageBadgeState;
  error?: string;
};

export async function fetchAnonymousAccessState(): Promise<{
  canGenerate: boolean;
  state: UsageBadgeState;
} | null> {
  const deviceId = getOrCreateDeviceId();

  try {
    const response = await fetch(
      `/api/anonymous/access?deviceId=${encodeURIComponent(deviceId)}`,
      { cache: "no-store" },
    );

    const data = (await response.json()) as AnonymousAccessResponse;

    if (!response.ok || !data.state) {
      return null;
    }

    return {
      canGenerate: data.canGenerate ?? false,
      state: data.state,
    };
  } catch {
    return null;
  }
}
