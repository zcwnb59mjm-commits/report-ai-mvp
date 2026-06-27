import { auth } from "@/auth";
import { USAGE_LIMIT_MESSAGE } from "@/lib/usage-limit";
import {
  getServerAccessStateForUser,
  recordServerGenerationUse,
} from "@/lib/user-access/server-access";

export type GenerationAccessResult =
  | { allowed: true; userId?: string }
  | { allowed: false; error: string; status: number };

export async function requireGenerationAccess(): Promise<GenerationAccessResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { allowed: true };
  }

  const access = await getServerAccessStateForUser(session.user.id);

  if (!access.canGenerate) {
    return {
      allowed: false,
      error: USAGE_LIMIT_MESSAGE,
      status: 403,
    };
  }

  return { allowed: true, userId: session.user.id };
}

export async function recordGenerationAccessUse(
  userId: string | undefined,
): Promise<void> {
  if (!userId) {
    return;
  }

  await recordServerGenerationUse(userId);
}
