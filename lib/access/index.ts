export type {
  AccessEntitlement,
  AccessGrantSource,
  ClientAccessGrant,
  UsageBadgeState,
} from "./types";

export {
  clearLifetimeUnlock,
  isLifetimeUnlocked,
  LIFETIME_UNLOCK_STORAGE_KEY,
  setLifetimeUnlocked,
} from "./lifetime-storage";

export {
  clearSubscriptionActive,
  getStoredCustomerEmail,
  getStoredSubscriptionId,
  getSubscriptionSyncHints,
  isSubscriptionActive,
  setSubscriptionActive,
  STRIPE_CUSTOMER_EMAIL_STORAGE_KEY,
  STRIPE_SUBSCRIPTION_ID_STORAGE_KEY,
  SUBSCRIPTION_ACTIVE_STORAGE_KEY,
} from "./subscription-storage";

export {
  activateCheckoutSession,
  activateCheckoutSessionWithRetry,
  activatePendingCheckoutSession,
  clearPendingCheckoutSessionId,
  getPendingCheckoutSessionId,
  PENDING_CHECKOUT_SESSION_STORAGE_KEY,
  storePendingCheckoutSessionId,
} from "./activate-checkout-session";

export {
  restoreSubscriptionByEmail,
  syncSubscriptionWithStripe,
} from "./sync-subscription-client";

export { getLocalAccessGrants } from "./local-access-grants";

export { hasUnlimitedGenerationAccess } from "./generation-access";
