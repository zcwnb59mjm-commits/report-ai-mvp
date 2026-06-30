import { NextResponse } from "next/server";

import { getAppUser } from "@/lib/auth/get-app-user";
import { getReportHistoryForUser } from "@/lib/report-history/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const appUser = await getAppUser();

  if (!appUser) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const { id } = await context.params;
  const history = await getReportHistoryForUser(appUser.prismaUser.id, id);

  if (!history) {
    return NextResponse.json(
      { error: "作成履歴が見つかりません。" },
      { status: 404 },
    );
  }

  return NextResponse.json({ history });
}
