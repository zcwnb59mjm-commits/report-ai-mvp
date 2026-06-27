"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLayoutEffect, useEffect, useState } from "react";

import { RestoreSubscriptionForm } from "@/components/restore-subscription-form";
import {
  activateCheckoutSessionWithRetry,
  storePendingCheckoutSessionId,
} from "@/lib/access/activate-checkout-session";
import { syncLoggedInUserFromClientState } from "@/lib/user-access/client-access";

const SITE_NAME = "ReportAI";

export function SuccessPageContent() {
  const searchParams = useSearchParams();
  const { status: authStatus } = useSession();
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
    if (!sessionId || authStatus === "loading") return;

    const checkoutSessionId = sessionId;
    let cancelled = false;

    async function activateSubscription() {
      const result = await activateCheckoutSessionWithRetry(checkoutSessionId);

      if (cancelled) return;

      if (result.success) {
        if (authStatus === "authenticated") {
          try {
            await syncLoggedInUserFromClientState();
          } catch {
            // localStorage activation still succeeded
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
  }, [authStatus, sessionId]);

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
              月480円プランが有効になりました。レポート作成を続けられます。
            </p>
            <div className="mt-12 flex justify-center sm:justify-start">
              <Link href="/generate" className="btn-primary">
                レポートを作成する
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
