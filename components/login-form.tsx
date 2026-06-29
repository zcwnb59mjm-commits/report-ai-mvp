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
  const [emailSent, setEmailSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    authError ? "ログインに失敗しました。もう一度お試しください。" : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        `${email.trim()} 宛にログインリンクを送信しました。メール内のリンクを開いてログインを完了してください。`,
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

  if (emailSent) {
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
          onClick={() => {
            setEmailSent(false);
            setMessage(null);
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
