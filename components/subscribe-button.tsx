"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuthUser } from "@/hooks/use-auth-user";
import { MONTHLY_PLAN_SUBSCRIBE_LABEL } from "@/lib/pricing";

export function SubscribeButton() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuthUser();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubscribe() {
    setErrorMessage(null);

    if (!isAuthenticated) {
      const next = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "決済ページの作成に失敗しました。");
      }

      window.location.href = data.url;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "決済ページの作成に失敗しました。",
      );
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={isLoading || loading}
        className="btn-primary w-full sm:w-auto"
      >
        {isLoading ? "接続中..." : MONTHLY_PLAN_SUBSCRIBE_LABEL}
      </button>
      {errorMessage ? <p className="alert-message">{errorMessage}</p> : null}
    </div>
  );
}
