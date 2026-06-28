import { NextResponse } from "next/server";

import { getAppUser } from "@/lib/auth/get-app-user";
import { getServerAccessStateForUser } from "@/lib/user-access/server-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const appUser = await getAppUser();

  if (!appUser) {
    return NextResponse.json({ isLoggedIn: false });
  }

  const access = await getServerAccessStateForUser(appUser.prismaUser.id);

  return NextResponse.json({
    isLoggedIn: true,
    user: {
      id: appUser.prismaUser.id,
      name: appUser.prismaUser.name,
      email: appUser.prismaUser.email,
      image: appUser.prismaUser.image,
    },
    ...access,
  });
}
