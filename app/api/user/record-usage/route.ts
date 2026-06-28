import { NextResponse } from "next/server";

import { getAppUser } from "@/lib/auth/get-app-user";
import { recordServerGenerationUse } from "@/lib/user-access/server-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const appUser = await getAppUser();

  if (!appUser) {
    return NextResponse.json(
      { error: "ログインが必要です。" },
      { status: 401 },
    );
  }

  await recordServerGenerationUse(appUser.prismaUser.id);

  return NextResponse.json({ ok: true });
}
