export type {
  AccessEntitlement,
  AccessGrantSource,
  ClientAccessGrant,
  UsageBadgeState,
} from "./types";

export {
  clearLifetimeUnlock,
  getLocalAccessGrants,
  isLifetimeUnlocked,
  LIFETIME_UNLOCK_STORAGE_KEY,
  setLifetimeUnlocked,
} from "./lifetime-storage";

export {
  canGenerateReport,
  getUsageBadgeState,
  hasUnlimitedGenerationAccess,
  recordGenerationUse,
} from "./generation-access";
