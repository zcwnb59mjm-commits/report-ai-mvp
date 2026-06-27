"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AccessStatus } from "@/components/access-status";
import { LoadingOverlay } from "@/components/loading-overlay";
import { SiteHeader } from "@/components/site-header";
import { useUsageBadgeState } from "@/hooks/use-usage-badge-state";
import { getOrCreateDeviceId } from "@/lib/device-id/device-id-storage";
import {
  REPORT_RESULT_STORAGE_KEY,
  REPORT_LEVELS,
  SUBMISSION_FORMATS,
  WRITING_STYLES,
  type ReportGenerateResult,
} from "@/lib/report";
import { USAGE_LIMIT_MESSAGE } from "@/lib/usage-limit";

export default function GeneratePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mounted, usageState, canGenerate, refreshUsageState } =
    useUsageBadgeState();

  const isLimitReached = mounted && !canGenerate;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!canGenerate) {
      setErrorMessage(USAGE_LIMIT_MESSAGE);
      await refreshUsageState();
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const theme = String(formData.get("theme") ?? "").trim();
    const wordCount = Number(formData.get("wordCount"));
    const courseName = String(formData.get("courseName") ?? "").trim();
    const submissionFormat = String(formData.get("submissionFormat") ?? "").trim();
    const writingStyle = String(formData.get("writingStyle") ?? "").trim();
    const reportLevel = String(formData.get("reportLevel") ?? "").trim();
    const professorInstructions = String(
      formData.get("professorInstructions") ?? "",
    ).trim();
    const requiredKeywords = String(formData.get("requiredKeywords") ?? "")
      .trim()
      .split(/[,、\n]/)
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId: getOrCreateDeviceId(),
          theme,
          wordCount,
          courseName,
          submissionFormat,
          writingStyle,
          reportLevel,
          professorInstructions: professorInstructions || undefined,
          requiredKeywords,
          sourceMaterials: [],
        }),
      });

      const data = (await response.json()) as ReportGenerateResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "レポート構成の生成に失敗しました。");
      }

      await refreshUsageState();
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

      <SiteHeader homeHref="/" />

      <main className="page-main">
        <div className="space-y-6 text-center sm:text-left">
          <div>
            <p className="page-eyebrow">レポート作成</p>
            <h1 className="page-title">テーマを入力する</h1>
            <p className="page-description">
              条件を入力して「レポートを作成」を押すと、AIが構成案を提案します。
            </p>
          </div>
          <AccessStatus
            mounted={mounted}
            state={usageState}
            onRefresh={() => {
              void refreshUsageState();
            }}
          />
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

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="writingStyle" className="field-label">
                文体
              </label>
              <select
                id="writingStyle"
                name="writingStyle"
                required
                defaultValue="desu-masu"
                className="select-field"
                disabled={isSubmitting}
              >
                {WRITING_STYLES.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reportLevel" className="field-label">
                レポートレベル
              </label>
              <select
                id="reportLevel"
                name="reportLevel"
                required
                defaultValue="standard"
                className="select-field"
                disabled={isSubmitting}
              >
                {REPORT_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="professorInstructions" className="field-label">
              教授からの指示
              <span className="ml-2 text-[12px] font-normal text-neutral-400">
                任意
              </span>
            </label>
            <textarea
              id="professorInstructions"
              name="professorInstructions"
              rows={3}
              placeholder="例：必ず自分の体験を1つ含めること"
              className="input-field min-h-[120px] resize-y"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="requiredKeywords" className="field-label">
              必ず含めたいキーワード
              <span className="ml-2 text-[12px] font-normal text-neutral-400">
                任意・カンマ区切り
              </span>
            </label>
            <input
              id="requiredKeywords"
              name="requiredKeywords"
              type="text"
              placeholder="例：自己効力感, ソーシャルキャピタル"
              className="input-field"
              disabled={isSubmitting}
            />
          </div>

          {errorMessage && !isLimitReached ? (
            <p className="alert-message">{errorMessage}</p>
          ) : null}

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !mounted || isLimitReached}
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
