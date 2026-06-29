"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

const RESEND_COOLDOWN_SECONDS = 60;

function getSafeNextPath(next: string | null): string {
  if (next && next.startsWith("/")) {
    return next;
  }

  return "/generate";
}

function formatAuthErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const authError = error as { message?: string; code?: string };
    const message = authError.message?.toLowerCase() ?? "";
    const code = authError.code?.toLowerCase() ?? "";

    if (
      message.includes("email rate limit exceeded") ||
      code === "over_email_send_rate_limit"
    ) {
      return "短時間に送信しすぎました。しばらく時間をおいて再度お試しください。";
    }

    if (error instanceof Error) {
      return error.message;
    }
  }

  return "メール送信に失敗しました。";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    authError ? "ログインに失敗しました。もう一度お試しください。" : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  async function sendMagicLink() {
    setErrorMessage(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setMessage(
        `${email.trim()} 宛にログインリンクを送信しました。メール内のリンクを開いてログインを完了してください。`,
      );
    } catch (error) {
      setErrorMessage(formatAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMagicLink();
  }

  async function handleResend() {
    if (isSubmitting || resendCooldown > 0) {
      return;
    }

    await sendMagicLink();
  }

  if (emailSent) {
    const canResend = !isSubmitting && resendCooldown === 0;

    return (
      <div className="space-y-6">
        <div className="card space-y-4 text-center sm:text-left">
          <p className="text-[13px] font-semibold tracking-wide text-neutral-400">
            メールを確認してください
          </p>
          <p className="text-[16px] leading-relaxed text-neutral-700">
            {message}
          </p>
          <p className="text-[14px] leading-relaxed text-neutral-500">
            届かない場合は迷惑メールフォルダもご確認ください。
          </p>
        </div>

        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "送信中..."
            : resendCooldown > 0
              ? `再送信は ${resendCooldown} 秒後に可能です`
              : "Magic Link を再送信"}
        </button>

        {errorMessage ? <p className="alert-message">{errorMessage}</p> : null}

        <button
          type="button"
          onClick={() => {
            setEmailSent(false);
            setMessage(null);
            setErrorMessage(null);
            setResendCooldown(0);
          }}
          className="btn-secondary w-full"
        >
          別のメールアドレスで試す
        </button>

        <p className="text-center text-[14px] text-neutral-500">
          <Link href={nextPath} className="underline underline-offset-4">
            ログインせずに戻る
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleEmailSubmit} className="card space-y-5">
        <div>
          <label htmlFor="email" className="field-label">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@email.com"
            className="input-field"
            disabled={isSubmitting}
            autoComplete="email"
          />
          <p className="mt-3 text-[14px] leading-relaxed text-neutral-500">
            入力したアドレス宛に、ワンクリックでログインできるリンクを送信します。
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || email.trim().length === 0}
          className="btn-primary w-full"
        >
          {isSubmitting ? "送信中..." : "Magic Link を送信"}
        </button>
      </form>

      {errorMessage ? <p className="alert-message">{errorMessage}</p> : null}

      <p className="text-center text-[14px] text-neutral-500">
        <Link href={nextPath} className="underline underline-offset-4">
          ログインせずに戻る
        </Link>
      </p>
    </div>
  );
}
