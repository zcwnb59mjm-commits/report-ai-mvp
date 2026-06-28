import { NextResponse } from "next/server";

import { getAppUser } from "@/lib/auth/get-app-user";
import { getAppOrigin } from "@/lib/app-url";
import { createStripeClient } from "@/lib/stripe/create-stripe-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const appUser = await getAppUser();

  if (!appUser) {
    return NextResponse.json(
      { error: "ログインが必要です。" },
      { status: 401 },
    );
  }

  const stripe = createStripeClient();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe が設定されていません。" },
      { status: 500 },
    );
  }

  if (!appUser.prismaUser.stripeCustomerId) {
    return NextResponse.json(
      { error: "Stripe Customer が見つかりません。有料プラン契約後にご利用ください。" },
      { status: 404 },
    );
  }

  try {
    const origin = getAppOrigin(request);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: appUser.prismaUser.stripeCustomerId,
      return_url: `${origin}/mypage`,
    });

    if (!portalSession.url) {
      throw new Error("Portal session URL is missing");
    }

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Failed to create Stripe Customer Portal session:", error);

    return NextResponse.json(
      { error: "請求管理ページの作成に失敗しました。" },
      { status: 500 },
    );
  }
}
