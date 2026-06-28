"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

function getSafeNextPath(next: string | null): string {
  if (next && next.startsWith("/")) {
    return next;
  }

  return "/generate";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    authError ? "ログインに失敗しました。もう一度お試しください。" : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      setMessage(
        "ログイン用のメールを送信しました。メール内のリンクを開くか、届いた確認コードを入力してください。",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "メール送信に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setMessage(null);
    setIsVerifyingOtp(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: "email",
      });

      if (error) {
        throw error;
      }

      window.location.href = nextPath;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "確認コードが正しくありません。",
      );
      setIsVerifyingOtp(false);
    }
  }

  return (
    <div className="space-y-8">
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
            disabled={isSubmitting || isVerifyingOtp}
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isVerifyingOtp || email.trim().length === 0}
          className="btn-primary w-full"
        >
          {isSubmitting ? "送信中..." : "ログイン用メールを送信"}
        </button>
      </form>

      {emailSent ? (
        <form onSubmit={handleOtpSubmit} className="card space-y-5">
          <div>
            <label htmlFor="otpCode" className="field-label">
              メールに届いた確認コード
            </label>
            <input
              id="otpCode"
              name="otpCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
              placeholder="123456"
              className="input-field"
              disabled={isVerifyingOtp}
            />
          </div>

          <button
            type="submit"
            disabled={isVerifyingOtp || otpCode.trim().length === 0}
            className="btn-secondary w-full"
          >
            {isVerifyingOtp ? "確認中..." : "確認コードでログイン"}
          </button>
        </form>
      ) : null}

      {/* Google / Apple OAuth — Supabase Provider 設定後に有効化
      <div className="space-y-3">
        <button type="button" className="btn-secondary w-full">
          Googleでログイン
        </button>
        <button type="button" className="btn-secondary w-full">
          Appleでログイン
        </button>
      </div>
      */}

      {message ? <p className="alert-message">{message}</p> : null}
      {errorMessage ? <p className="alert-message">{errorMessage}</p> : null}

      <p className="text-center text-[14px] text-neutral-500">
        <Link href={nextPath} className="underline underline-offset-4">
          ログインせずに戻る
        </Link>
      </p>
    </div>
  );
}
