"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLayoutEffect, useEffect, useState } from "react";

import { RestoreSubscriptionForm } from "@/components/restore-subscription-form";
import {
  activateCheckoutSessionWithRetry,
  storePendingCheckoutSessionId,
} from "@/lib/access/activate-checkout-session";
import { MONTHLY_PLAN_SUCCESS_MESSAGE } from "@/lib/pricing";
import { useAuthUser } from "@/hooks/use-auth-user";
import { syncLoggedInUserFromClientState } from "@/lib/user-access/client-access";

const SITE_NAME = "ReportAI";

export function SuccessPageContent() {
  const searchParams = useSearchParams();
  const { loading: authLoading, isAuthenticated } = useAuthUser();
  const sessionId = searchParams.get("session_id");
  const [pageStatus, setPageStatus] = useState<"loading" | "success" | "error">(
    sessionId ? "loading" : "error",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    sessionId ? null : "決済情報が見つかりません。",
  );

  useLayoutEffect(() => {
    if (sessionId) {
      storePendingCheckoutSessionId(sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || authLoading) return;

    const checkoutSessionId = sessionId;
    let cancelled = false;

    async function activateSubscription() {
      const result = await activateCheckoutSessionWithRetry(checkoutSessionId);

      if (cancelled) return;

      if (result.success) {
        if (isAuthenticated) {
          try {
            await syncLoggedInUserFromClientState();
          } catch {
            // Checkout verification still succeeded.
          }
        }

        setPageStatus("success");
        return;
      }

      setPageStatus("error");
      setErrorMessage(result.error);
    }

    void activateSubscription();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, sessionId]);

  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-logo">
            {SITE_NAME}
          </Link>
        </div>
      </header>

      <main className="page-main text-center sm:text-left">
        {pageStatus === "loading" ? (
          <>
            <p className="page-eyebrow">登録確認中</p>
            <h1 className="page-title">決済を確認しています</h1>
            <p className="page-description">
              有料プランを有効化しています。この画面を閉じずにお待ちください。
            </p>
          </>
        ) : null}

        {pageStatus === "success" ? (
          <>
            <p className="page-eyebrow">登録完了</p>
            <h1 className="page-title">ご登録ありがとうございます</h1>
            <p className="page-description">
              {MONTHLY_PLAN_SUCCESS_MESSAGE}
            </p>
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
              <Link href="/generate" className="btn-primary">
                レポートを作成する
              </Link>
              <Link href="/mypage" className="btn-secondary px-6 py-3 text-[15px]">
                マイページへ
              </Link>
            </div>
          </>
        ) : null}

        {pageStatus === "error" ? (
          <>
            <p className="page-eyebrow">登録確認</p>
            <h1 className="page-title">有料プランを有効化できませんでした</h1>
            <p className="page-description">
              {errorMessage ??
                "決済情報の確認に失敗しました。時間をおいて再度お試しください。"}
            </p>
            <div className="mt-10">
              <RestoreSubscriptionForm
                onRestored={() => {
                  window.location.href = "/generate";
                }}
              />
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
