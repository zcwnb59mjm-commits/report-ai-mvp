"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { LoadingOverlay } from "@/components/loading-overlay";
import { UsageBadge } from "@/components/usage-badge";
import {
  REPORT_RESULT_STORAGE_KEY,
  SUBMISSION_FORMATS,
  type ReportGenerateResult,
} from "@/lib/report";
import {
  canUseFreeGeneration,
  getRemainingUses,
  incrementUsageCount,
  USAGE_LIMIT_MESSAGE,
} from "@/lib/usage-limit";

const SITE_NAME = "ReportAI";

export default function GeneratePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remainingUses, setRemainingUses] = useState<number | null>(null);

  useEffect(() => {
    setRemainingUses(getRemainingUses());
  }, []);

  const isLimitReached = remainingUses === 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!canUseFreeGeneration()) {
      setErrorMessage(USAGE_LIMIT_MESSAGE);
      setRemainingUses(0);
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const theme = String(formData.get("theme") ?? "").trim();
    const wordCount = Number(formData.get("wordCount"));
    const courseName = String(formData.get("courseName") ?? "").trim();
    const submissionFormat = String(formData.get("submissionFormat") ?? "").trim();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme,
          wordCount,
          courseName,
          submissionFormat,
        }),
      });

      const data = (await response.json()) as ReportGenerateResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "レポート構成の生成に失敗しました。");
      }

      incrementUsageCount();
      setRemainingUses(getRemainingUses());
      sessionStorage.setItem(REPORT_RESULT_STORAGE_KEY, JSON.stringify(data));
      router.push("/result");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "レポート構成の生成に失敗しました。",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      {isSubmitting ? <LoadingOverlay /> : null}

      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-logo">
            {SITE_NAME}
          </Link>
        </div>
      </header>

      <main className="page-main">
        <div className="space-y-6 text-center sm:text-left">
          <div>
            <p className="page-eyebrow">レポート作成</p>
            <h1 className="page-title">テーマを入力する</h1>
            <p className="page-description">
              条件を入力して「レポートを作成」を押すと、AIが構成案を提案します。
            </p>
          </div>
          <UsageBadge remaining={remainingUses} />
        </div>

        <form onSubmit={handleSubmit} className="card mt-12 space-y-8">
          <div>
            <label htmlFor="theme" className="field-label">
              レポートテーマ
            </label>
            <input
              id="theme"
              name="theme"
              type="text"
              required
              placeholder="例：SNSが若者の自己表現に与える影響"
              className="input-field"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="wordCount" className="field-label">
              文字数
            </label>
            <input
              id="wordCount"
              name="wordCount"
              type="number"
              required
              min={500}
              max={20000}
              step={100}
              placeholder="例：3000"
              className="input-field"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="courseName" className="field-label">
              授業名
            </label>
            <input
              id="courseName"
              name="courseName"
              type="text"
              required
              placeholder="例：現代社会学概論"
              className="input-field"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="submissionFormat" className="field-label">
              提出形式
            </label>
            <select
              id="submissionFormat"
              name="submissionFormat"
              required
              defaultValue=""
              className="select-field"
              disabled={isSubmitting}
            >
              <option value="" disabled>
                選択してください
              </option>
              {SUBMISSION_FORMATS.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>

          {errorMessage && !isLimitReached ? (
            <p className="alert-message">{errorMessage}</p>
          ) : null}

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isLimitReached}
              className="btn-primary"
            >
              レポートを作成
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
