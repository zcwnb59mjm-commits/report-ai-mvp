import type { UsageBadgeState } from "@/lib/access/types";
import { FREE_USAGE_LIMIT } from "@/lib/usage-limit";
import { prisma } from "@/lib/prisma";

export type ServerAccessState = {
  canGenerate: boolean;
  state: UsageBadgeState;
};

export async function getServerAccessStateForUser(
  userId: string,
): Promise<ServerAccessState> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      usageCount: true,
      subscriptionActive: true,
      lifetimeUnlocked: true,
    },
  });

  if (!user) {
    return {
      canGenerate: false,
      state: { mode: "exhausted" },
    };
  }

  if (user.lifetimeUnlocked) {
    return {
      canGenerate: true,
      state: { mode: "lifetime" },
    };
  }

  if (user.subscriptionActive) {
    return {
      canGenerate: true,
      state: { mode: "subscription" },
    };
  }

  const remaining = Math.max(FREE_USAGE_LIMIT - user.usageCount, 0);

  if (remaining === 0) {
    return {
      canGenerate: false,
      state: { mode: "exhausted" },
    };
  }

  return {
    canGenerate: true,
    state: { mode: "free", remaining },
  };
}

export async function recordServerGenerationUse(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      usageCount: true,
      subscriptionActive: true,
      lifetimeUnlocked: true,
    },
  });

  if (!user || user.lifetimeUnlocked || user.subscriptionActive) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      usageCount: Math.min(user.usageCount + 1, FREE_USAGE_LIMIT),
    },
  });
}

export async function setUserLifetimeUnlocked(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lifetimeUnlocked: true },
  });
}
