import { NextResponse } from "next/server";

import { getAppUser } from "@/lib/auth/get-app-user";
import { listReportHistoriesForUser } from "@/lib/report-history/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const appUser = await getAppUser();

  if (!appUser) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const histories = await listReportHistoriesForUser(appUser.prismaUser.id);

  return NextResponse.json({ histories });
}
