-- CreateTable
CREATE TABLE "anonymous_usages" (
    "deviceId" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "lifetimeUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anonymous_usages_pkey" PRIMARY KEY ("deviceId")
);
