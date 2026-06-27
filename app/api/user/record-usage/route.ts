import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { USAGE_LIMIT_MESSAGE } from "@/lib/usage-limit";
import {
  getServerAccessStateForUser,
  recordServerGenerationUse,
} from "@/lib/user-access/server-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "ログインが必要です。" },
      { status: 401 },
    );
  }

  const access = await getServerAccessStateForUser(session.user.id);

  if (!access.canGenerate) {
    return NextResponse.json(
      { error: USAGE_LIMIT_MESSAGE },
      { status: 403 },
    );
  }

  await recordServerGenerationUse(session.user.id);

  const updatedAccess = await getServerAccessStateForUser(session.user.id);

  return NextResponse.json(updatedAccess);
}
