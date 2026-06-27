import { getLocalAccessGrants } from "./local-access-grants";
import type { AccessEntitlement } from "./types";

function hasEntitlement(entitlement: AccessEntitlement): boolean {
  return getLocalAccessGrants().some((grant) =>
    grant.entitlements.includes(entitlement),
  );
}

export function hasUnlimitedGenerationAccess(): boolean {
  return hasEntitlement("unlimited-generation");
}
