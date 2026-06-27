import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getServerAccessStateForUser } from "@/lib/user-access/server-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ isLoggedIn: false });
  }

  const access = await getServerAccessStateForUser(session.user.id);

  return NextResponse.json({
    isLoggedIn: true,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    },
    ...access,
  });
}
