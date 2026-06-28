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
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    authError ? "ログインに失敗しました。もう一度お試しください。" : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

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

      setMessage("ログインリンクをメールで送信しました。メール内のリンクから続行してください。");
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

  async function handleOAuthSignIn(provider: "google" | "apple") {
    setErrorMessage(null);
    setMessage(null);
    setOauthLoading(provider);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "ログインに失敗しました。",
      );
      setOauthLoading(null);
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
            disabled={isSubmitting}
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || email.trim().length === 0}
          className="btn-primary w-full"
        >
          {isSubmitting ? "送信中..." : "メールでログイン"}
        </button>
      </form>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleOAuthSignIn("google")}
          disabled={oauthLoading !== null}
          className="btn-secondary w-full"
        >
          {oauthLoading === "google" ? "接続中..." : "Googleでログイン"}
        </button>
        <button
          type="button"
          onClick={() => handleOAuthSignIn("apple")}
          disabled={oauthLoading !== null}
          className="btn-secondary w-full"
        >
          {oauthLoading === "apple" ? "接続中..." : "Appleでログイン"}
        </button>
      </div>

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
