"use client";

import { FormEvent, useEffect, useState } from "react";

import { getUsageBadgeState, setLifetimeUnlocked } from "@/lib/access";

type SerialCodeFormProps = {
  compact?: boolean;
  onUnlocked?: () => void;
};

export function SerialCodeForm({ compact = false, onUnlocked }: SerialCodeFormProps) {
  const [mounted, setMounted] = useState(false);
  const [serialCode, setSerialCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const state = getUsageBadgeState();
    setIsUnlocked(state.mode === "lifetime" || state.mode === "subscription");
    setMounted(true);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/serial/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serialCode }),
      });

      const data = (await response.json()) as {
        valid?: boolean;
        error?: string;
      };

      if (!response.ok || !data.valid) {
        throw new Error(data.error ?? "シリアルコードが正しくありません");
      }

      setLifetimeUnlocked();
      setIsUnlocked(true);
      setSerialCode("");
      onUnlocked?.();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "シリアルコードが正しくありません",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (mounted && isUnlocked) {
    const badgeLabel =
      getUsageBadgeState().mode === "subscription"
        ? "月980円プラン有効"
        : "永久利用プラン有効";

    return (
      <div className={compact ? "text-center sm:text-left" : undefined}>
        <span className="usage-badge-lifetime">{badgeLabel}</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={compact ? "space-y-4" : "card-white mx-auto max-w-md space-y-5"}
    >
      {!compact ? (
        <div className="text-center">
          <p className="text-[13px] font-semibold tracking-wide text-neutral-400">
            シリアルコード
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
            購入済みの方はコードを入力して永久利用を有効にできます。
          </p>
        </div>
      ) : null}

      <div>
        {!compact ? (
          <label htmlFor="serialCode" className="field-label">
            シリアルコード入力
          </label>
        ) : (
          <label htmlFor="serialCode-compact" className="field-label">
            シリアルコード入力
          </label>
        )}
        <input
          id={compact ? "serialCode-compact" : "serialCode"}
          name="serialCode"
          type="text"
          value={serialCode}
          onChange={(event) => setSerialCode(event.target.value)}
          placeholder="XXXX-XXXX-XXXX"
          className="input-field"
          disabled={isSubmitting}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {errorMessage ? <p className="alert-message">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting || serialCode.trim().length === 0}
        className={compact ? "btn-secondary w-full sm:w-auto" : "btn-secondary w-full"}
      >
        {isSubmitting ? "確認中..." : "コードを適用"}
      </button>
    </form>
  );
}
