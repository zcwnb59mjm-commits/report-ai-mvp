import type { AccessEntitlement, AccessGrantSource, ClientAccessGrant } from "./types";

export const LIFETIME_UNLOCK_STORAGE_KEY = "isLifetimeUnlocked";

const LIFETIME_UNLOCK_VALUE = "true";

export function isLifetimeUnlocked(): boolean {
  if (typeof window === "undefined") return false;

  return localStorage.getItem(LIFETIME_UNLOCK_STORAGE_KEY) === LIFETIME_UNLOCK_VALUE;
}

export function setLifetimeUnlocked(): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(LIFETIME_UNLOCK_STORAGE_KEY, LIFETIME_UNLOCK_VALUE);
}

export function clearLifetimeUnlock(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(LIFETIME_UNLOCK_STORAGE_KEY);
}

/** 将来: アカウント権限と localStorage のローカル付与を統合する入口 */
export function getLocalAccessGrants(): ClientAccessGrant[] {
  if (!isLifetimeUnlocked()) return [];

  return [
    {
      source: "lifetime-serial" as AccessGrantSource,
      entitlements: ["unlimited-generation"] as AccessEntitlement[],
    },
  ];
}
