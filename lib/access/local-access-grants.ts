import type { AccessEntitlement, AccessGrantSource, ClientAccessGrant } from "./types";
import { isLifetimeUnlocked } from "./lifetime-storage";
import { isSubscriptionActive } from "./subscription-storage";

/** 将来: アカウント権限と localStorage のローカル付与を統合する入口 */
export function getLocalAccessGrants(): ClientAccessGrant[] {
  const grants: ClientAccessGrant[] = [];

  if (isLifetimeUnlocked()) {
    grants.push({
      source: "lifetime-serial" as AccessGrantSource,
      entitlements: ["unlimited-generation"] as AccessEntitlement[],
    });
  }

  if (isSubscriptionActive()) {
    grants.push({
      source: "stripe-subscription" as AccessGrantSource,
      entitlements: ["unlimited-generation"] as AccessEntitlement[],
    });
  }

  return grants;
}
