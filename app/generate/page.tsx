"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AccessStatus } from "@/components/access-status";
import { FieldLabel } from "@/components/field-label";
import { LoadingOverlay } from "@/components/loading-overlay";
import { MaterialUpload } from "@/components/material-upload";
import { SiteHeader } from "@/components/site-header";
import { useUsageBadgeState } from "@/hooks/use-usage-badge-state";
import { getOrCreateDeviceId } from "@/lib/device-id/device-id-storage";
import type { SourceMaterial } from "@/lib/report-generation";
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
  const [sourceMaterial, setSourceMaterial] = useState<SourceMaterial | null>(
    null,
  );
  const [isExtractingMaterial, setIsExtractingMaterial] = useState(false);
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
          sourceMaterials: sourceMaterial ? [sourceMaterial] : [],
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
            <FieldLabel htmlFor="theme" required>
              レポートテーマ
            </FieldLabel>
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
            <FieldLabel htmlFor="wordCount" required>
              文字数
            </FieldLabel>
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
            <FieldLabel htmlFor="courseName" required>
              授業名
            </FieldLabel>
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
            <FieldLabel htmlFor="submissionFormat" required>
              提出形式
            </FieldLabel>
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
              <FieldLabel htmlFor="writingStyle" required>
                文体
              </FieldLabel>
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
              <FieldLabel htmlFor="reportLevel" required>
                レポートレベル
              </FieldLabel>
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
            <FieldLabel htmlFor="professorInstructions" optional>
              教授からの指示
            </FieldLabel>
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
            <FieldLabel
              htmlFor="requiredKeywords"
              optional
              optionalText="任意・カンマ区切り"
            >
              必ず含めたいキーワード
            </FieldLabel>
            <input
              id="requiredKeywords"
              name="requiredKeywords"
              type="text"
              placeholder="例：自己効力感, ソーシャルキャピタル"
              className="input-field"
              disabled={isSubmitting}
            />
          </div>

          <MaterialUpload
            disabled={isSubmitting}
            value={sourceMaterial}
            onChange={setSourceMaterial}
            onExtractingChange={setIsExtractingMaterial}
          />

          {errorMessage && !isLimitReached ? (
            <p className="alert-message">{errorMessage}</p>
          ) : null}

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={
                isSubmitting || !mounted || isLimitReached || isExtractingMaterial
              }
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
