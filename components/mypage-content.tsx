"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuthUser } from "@/hooks/use-auth-user";
import type { UsageBadgeState } from "@/lib/access/types";
import { MONTHLY_PLAN_PRICE_LABEL } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/client";

type MypageAccessResponse = {
  isLoggedIn?: boolean;
  canGenerate?: boolean;
  state?: UsageBadgeState;
  user?: {
    email?: string | null;
  };
};

function getPlanLabel(state: UsageBadgeState | null | undefined): string {
  if (!state) return "確認中...";

  if (state.mode === "lifetime") return "永久利用プラン";
  if (state.mode === "subscription") return `月480円プラン（${MONTHLY_PLAN_PRICE_LABEL}）`;
  if (state.mode === "free") return `フリープラン（残り ${state.remaining} 回）`;
  return "フリープラン（利用上限到達）";
}

function getContractStatus(state: UsageBadgeState | null | undefined): string {
  if (!state) return "確認中...";

  if (state.mode === "lifetime") return "永久利用が有効です";
  if (state.mode === "subscription") return "有料プラン契約中";
  if (state.mode === "free") return "無料プラン利用中";
  return "無料利用上限に達しています";
}

export function MypageContent() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuthUser();
  const [access, setAccess] = useState<MypageAccessResponse | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAccess = useCallback(async () => {
    const response = await fetch("/api/user/access", { cache: "no-store" });
    const data = (await response.json()) as MypageAccessResponse;
    setAccess(data);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login?next=/mypage");
      return;
    }

    void loadAccess();
  }, [isAuthenticated, loadAccess, loading, router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  async function handleOpenPortal() {
    setErrorMessage(null);
    setPortalLoading(true);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "請求管理ページを開けませんでした。");
      }

      window.location.href = data.url;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "請求管理ページを開けませんでした。",
      );
      setPortalLoading(false);
    }
  }

  if (loading || !isAuthenticated) {
    return (
      <span
        className="inline-block h-9 w-40 rounded-full bg-neutral-100"
        aria-hidden="true"
      />
    );
  }

  const planLabel = getPlanLabel(access?.state);
  const contractStatus = getContractStatus(access?.state);
  const isPremium =
    access?.state?.mode === "subscription" ||
    access?.state?.mode === "lifetime";

  return (
    <div className="space-y-8">
      <section className="card space-y-5">
        <div>
          <p className="text-[13px] font-semibold tracking-wide text-neutral-400">
            アカウント
          </p>
          <p className="mt-2 text-[16px] text-neutral-800">
            {user?.email ?? access?.user?.email}
          </p>
        </div>

        <div>
          <p className="text-[13px] font-semibold tracking-wide text-neutral-400">
            現在のプラン
          </p>
          <p className="mt-2 text-[16px] font-semibold text-black">{planLabel}</p>
        </div>

        <div>
          <p className="text-[13px] font-semibold tracking-wide text-neutral-400">
            契約状況
          </p>
          <p className="mt-2 text-[16px] text-neutral-700">{contractStatus}</p>
          {isPremium ? (
            <p className="mt-2 text-[14px] text-neutral-500">
              Premiumユーザーはレポート作成回数が無制限です。
            </p>
          ) : null}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {access?.state?.mode === "subscription" ? (
          <button
            type="button"
            onClick={handleOpenPortal}
            disabled={portalLoading}
            className="btn-primary"
          >
            {portalLoading ? "接続中..." : "サブスク管理（Stripe）"}
          </button>
        ) : null}
        <Link href="/generate" className="btn-secondary px-6 py-3 text-[15px]">
          レポートを作成
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="btn-secondary px-6 py-3 text-[15px]"
        >
          ログアウト
        </button>
      </div>

      {errorMessage ? <p className="alert-message">{errorMessage}</p> : null}
    </div>
  );
}
