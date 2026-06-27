/** 将来の Google ログイン連携時にサーバー側の権限とマージする */
export type AccessEntitlement = "unlimited-generation";

export type AccessGrantSource =
  | "lifetime-serial"
  | "stripe-subscription"
  | "account";

export type ClientAccessGrant = {
  source: AccessGrantSource;
  entitlements: AccessEntitlement[];
};

export type UsageBadgeState =
  | { mode: "lifetime" }
  | { mode: "subscription" }
  | { mode: "free"; remaining: number }
  | { mode: "exhausted" };
