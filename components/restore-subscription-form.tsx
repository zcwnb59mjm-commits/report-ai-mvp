"use client";

import { FormEvent, useEffect, useState } from "react";

import { useAuthUser } from "@/hooks/use-auth-user";
import { restoreSubscriptionByEmail } from "@/lib/access/sync-subscription-client";
import { syncLoggedInUserFromClientState } from "@/lib/user-access/client-access";

type RestoreSubscriptionFormProps = {
  compact?: boolean;
  onRestored?: () => void;
};

export function RestoreSubscriptionForm({
  compact = false,
  onRestored,
}: RestoreSubscriptionFormProps) {
  const { user, loading, isAuthenticated } = useAuthUser();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const restoreEmail = email.trim() || user?.email || "";
    const result = await restoreSubscriptionByEmail(restoreEmail);

    if (result.success) {
      if (isAuthenticated) {
        try {
          await syncLoggedInUserFromClientState();
        } catch {
          // localStorage restore still succeeded
        }
      }

      setEmail(restoreEmail);
      onRestored?.();
      setIsSubmitting(false);
      return;
    }

    setErrorMessage(result.error);
    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={compact ? "space-y-4" : "card-white space-y-5"}
    >
      {!compact ? (
        <div>
          <p className="text-[13px] font-semibold tracking-wide text-neutral-400">
            購入済みの方
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
            決済時のメールアドレスを入力すると、有料プランを復元できます。
          </p>
        </div>
      ) : (
        <p className="text-[14px] leading-relaxed text-neutral-500">
          すでに購入済みの方は、決済時のメールアドレスで有料プランを復元できます。
        </p>
      )}

      <div>
        <label htmlFor={compact ? "restoreEmail-compact" : "restoreEmail"} className="field-label">
          決済時のメールアドレス
        </label>
        <input
          id={compact ? "restoreEmail-compact" : "restoreEmail"}
          name="restoreEmail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="example@email.com"
          className="input-field"
          disabled={isSubmitting || loading}
          autoComplete="email"
          required
        />
      </div>

      {errorMessage ? <p className="alert-message">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting || email.trim().length === 0}
        className="btn-secondary w-full sm:w-auto"
      >
        {isSubmitting ? "確認中..." : "購入済みプランを復元する"}
      </button>
    </form>
  );
}
