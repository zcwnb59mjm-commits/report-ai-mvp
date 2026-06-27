import type { UsageBadgeState } from "@/lib/access/types";
import { prisma } from "@/lib/prisma";
import { FREE_USAGE_LIMIT } from "@/lib/usage-limit";
import { isValidDeviceId } from "@/lib/device-id/device-id-storage";

export type AnonymousAccessState = {
  canGenerate: boolean;
  state: UsageBadgeState;
};

type EnsureAnonymousUsageInput = {
  deviceId: string;
  userAgent?: string | null;
  ipHash?: string | null;
};

function toAnonymousAccessState(record: {
  usageCount: number;
  lifetimeUnlocked: boolean;
  subscriptionActive: boolean;
}): AnonymousAccessState {
  if (record.lifetimeUnlocked) {
    return {
      canGenerate: true,
      state: { mode: "lifetime" },
    };
  }

  if (record.subscriptionActive) {
    return {
      canGenerate: true,
      state: { mode: "subscription" },
    };
  }

  const remaining = Math.max(FREE_USAGE_LIMIT - record.usageCount, 0);

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

export async function ensureAnonymousUsage({
  deviceId,
  userAgent,
  ipHash,
}: EnsureAnonymousUsageInput) {
  if (!isValidDeviceId(deviceId)) {
    throw new Error("Invalid deviceId");
  }

  return prisma.anonymousUsage.upsert({
    where: { deviceId },
    create: {
      deviceId,
      userAgent: userAgent ?? null,
      ipHash: ipHash ?? null,
    },
    update: {
      ...(userAgent ? { userAgent } : {}),
      ...(ipHash ? { ipHash } : {}),
    },
  });
}

export async function getAnonymousAccessState(
  deviceId: string,
): Promise<AnonymousAccessState> {
  if (!isValidDeviceId(deviceId)) {
    return {
      canGenerate: false,
      state: { mode: "exhausted" },
    };
  }

  const record = await prisma.anonymousUsage.findUnique({
    where: { deviceId },
    select: {
      usageCount: true,
      lifetimeUnlocked: true,
      subscriptionActive: true,
    },
  });

  if (!record) {
    return {
      canGenerate: true,
      state: { mode: "free", remaining: FREE_USAGE_LIMIT },
    };
  }

  return toAnonymousAccessState(record);
}

export async function recordAnonymousGenerationUse(
  deviceId: string,
): Promise<void> {
  const record = await prisma.anonymousUsage.findUnique({
    where: { deviceId },
    select: {
      usageCount: true,
      lifetimeUnlocked: true,
      subscriptionActive: true,
    },
  });

  if (!record || record.lifetimeUnlocked || record.subscriptionActive) {
    return;
  }

  await prisma.anonymousUsage.update({
    where: { deviceId },
    data: {
      usageCount: Math.min(record.usageCount + 1, FREE_USAGE_LIMIT),
    },
  });
}

export async function setAnonymousLifetimeUnlocked(
  deviceId: string,
): Promise<void> {
  if (!isValidDeviceId(deviceId)) return;

  await ensureAnonymousUsage({ deviceId });
  await prisma.anonymousUsage.update({
    where: { deviceId },
    data: { lifetimeUnlocked: true },
  });
}

export async function setAnonymousSubscriptionActive(
  deviceId: string,
  active: boolean,
): Promise<void> {
  if (!isValidDeviceId(deviceId)) return;

  await ensureAnonymousUsage({ deviceId });
  await prisma.anonymousUsage.update({
    where: { deviceId },
    data: { subscriptionActive: active },
  });
}

export async function mergeAnonymousUsageIntoUser(
  userId: string,
  deviceId: string,
): Promise<void> {
  if (!isValidDeviceId(deviceId)) return;

  const anonymous = await prisma.anonymousUsage.findUnique({
    where: { deviceId },
    select: {
      usageCount: true,
      lifetimeUnlocked: true,
    },
  });

  if (!anonymous) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { usageCount: true, lifetimeUnlocked: true },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      usageCount: Math.max(user.usageCount, anonymous.usageCount),
      ...(anonymous.lifetimeUnlocked && !user.lifetimeUnlocked
        ? { lifetimeUnlocked: true }
        : {}),
    },
  });
}
