import { NextResponse } from "next/server";

import { syncSubscriptionWithStripe } from "@/lib/subscription/sync-subscription";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { valid: false, error: "リクエスト形式が正しくありません。" },
      { status: 400 },
    );
  }

  const subscriptionId =
    typeof body.subscriptionId === "string" ? body.subscriptionId.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  const result = await syncSubscriptionWithStripe({
    subscriptionId: subscriptionId || undefined,
    email: email || undefined,
  });

  if (!result.valid) {
    const status = result.error.includes("必要") ? 400 : 404;

    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
