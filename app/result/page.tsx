"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AuthButton } from "@/components/auth-button";
import { LoadingOverlay } from "@/components/loading-overlay";
import { SerialCodeForm } from "@/components/serial-code-form";
import { UsageBadge } from "@/components/usage-badge";
import { useUsageBadgeState } from "@/hooks/use-usage-badge-state";
import {
  getReportLevelLabel,
  getWritingStyleLabel,
} from "@/lib/report-generation";
import {
  normalizeReportGenerateResult,
  OUTLINE_SECTIONS,
  REPORT_RESULT_STORAGE_KEY,
  type ReportGenerateResult,
} from "@/lib/report";
import { downloadReportDocx } from "@/lib/export-report-docx";
import { downloadReportPdf } from "@/lib/export-report-pdf";
import { USAGE_LIMIT_MESSAGE } from "@/lib/usage-limit";
import {
  canGenerateReportForCurrentUser,
  recordGenerationUseForCurrentUser,
} from "@/lib/user-access/generation-client";

function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="section-heading">{children}</h2>;
}

function ResultCard({ children }: { children: ReactNode }) {
  return <section className="card">{children}</section>;
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="meta-label">{label}</dt>
      <dd className="meta-value">{value}</dd>
    </div>
  );
}

function ExportButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn-secondary-lg min-w-[140px] flex-1 sm:flex-none"
    >
      {children}
    </button>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ReportGenerateResult | null>(null);
  const [isGeneratingBody, setIsGeneratingBody] = useState(false);
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("コピー");
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const { mounted, usageState, refreshUsageState, isLoggedIn } =
    useUsageBadgeState();

  const isLimitReached = mounted && usageState?.mode === "exhausted";
  const isExporting = isDownloadingDocx || isDownloadingPdf;

  useEffect(() => {
    const stored = sessionStorage.getItem(REPORT_RESULT_STORAGE_KEY);

    if (!stored) {
      router.replace("/generate");
      return;
    }

    try {
      const parsed: unknown = JSON.parse(stored);

      const normalized =
        typeof parsed === "object" && parsed !== null
          ? normalizeReportGenerateResult(parsed as Record<string, unknown>)
          : null;

      if (!normalized) {
        throw new Error("Invalid stored result");
      }

      setResult(normalized);
    } catch {
      sessionStorage.removeItem(REPORT_RESULT_STORAGE_KEY);
      router.replace("/generate");
    }
  }, [router]);

  function persistResult(updated: ReportGenerateResult) {
    setResult(updated);
    sessionStorage.setItem(REPORT_RESULT_STORAGE_KEY, JSON.stringify(updated));
  }

  async function handleGenerateBody() {
    if (!result) return;

    setBodyError(null);

    if (!(await canGenerateReportForCurrentUser(isLoggedIn))) {
      setBodyError(USAGE_LIMIT_MESSAGE);
      await refreshUsageState();
      return;
    }

    setIsGeneratingBody(true);

    try {
      const response = await fetch("/api/generate/body", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: result.theme,
          wordCount: result.wordCount,
          courseName: result.courseName,
          submissionFormat: result.submissionFormat,
          writingStyle: result.writingStyle,
          reportLevel: result.reportLevel,
          professorInstructions: result.professorInstructions,
          requiredKeywords: result.requiredKeywords,
          sourceMaterials: result.sourceMaterials,
          outline: result.outline,
        }),
      });

      const data = (await response.json()) as { body?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "本文の生成に失敗しました。");
      }

      if (!data.body) {
        throw new Error("本文の生成に失敗しました。");
      }

      await recordGenerationUseForCurrentUser(isLoggedIn);
      await refreshUsageState();
      persistResult({ ...result, body: data.body });
    } catch (error) {
      setBodyError(
        error instanceof Error ? error.message : "本文の生成に失敗しました。",
      );
    } finally {
      setIsGeneratingBody(false);
    }
  }

  async function handleCopyBody() {
    if (!result?.body) return;

    try {
      await navigator.clipboard.writeText(result.body);
      setCopyLabel("コピーしました");
      setTimeout(() => setCopyLabel("コピー"), 2000);
    } catch {
      setBodyError("クリップボードへのコピーに失敗しました。");
    }
  }

  async function handleDownloadDocx() {
    if (!result?.body) return;

    setBodyError(null);
    setIsDownloadingDocx(true);

    try {
      await downloadReportDocx({
        theme: result.theme,
        courseName: result.courseName,
        body: result.body,
      });
    } catch {
      setBodyError("Wordファイルのダウンロードに失敗しました。");
    } finally {
      setIsDownloadingDocx(false);
    }
  }

  async function handleDownloadPdf() {
    if (!result?.body) return;

    setBodyError(null);
    setIsDownloadingPdf(true);

    try {
      await downloadReportPdf({
        theme: result.theme,
        courseName: result.courseName,
        body: result.body,
      });
    } catch {
      setBodyError("PDFファイルのダウンロードに失敗しました。");
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  if (!result) {
    return (
      <div className="page-shell">
        <LoadingOverlay message="読み込み中…" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      {isGeneratingBody ? <LoadingOverlay /> : null}

      <header className="site-header">
        <div className="site-header-inner max-w-3xl">
          <Link href="/" className="site-logo">
            ReportAI
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/generate" className="btn-secondary px-5 py-2.5 text-[13px]">
              新しく作成
            </Link>
            <AuthButton compact />
          </div>
        </div>
      </header>

      <main className="page-main-wide">
        <div className="space-y-6 text-center sm:text-left">
          <div>
            <p className="page-eyebrow">生成結果</p>
            <h1 className="page-title">レポート構成</h1>
            <p className="page-description">
              構成を確認し、本文を生成できます。
            </p>
          </div>
          <UsageBadge
            mounted={mounted}
            state={usageState}
            onSubscriptionRestored={() => {
              void refreshUsageState();
            }}
          />
          <SerialCodeForm
            compact
            onUnlocked={() => {
              void refreshUsageState();
            }}
          />
        </div>

        <div className="mt-12 space-y-8">
          <ResultCard>
            <dl className="grid gap-8 sm:grid-cols-2">
              <MetaItem label="レポートテーマ" value={result.theme} />
              <MetaItem
                label="文字数"
                value={`${result.wordCount.toLocaleString()}字`}
              />
              <MetaItem label="授業名" value={result.courseName} />
              <MetaItem label="提出形式" value={result.submissionFormat} />
              <MetaItem
                label="文体"
                value={getWritingStyleLabel(result.writingStyle)}
              />
              <MetaItem
                label="レポートレベル"
                value={getReportLevelLabel(result.reportLevel)}
              />
              {result.professorInstructions ? (
                <MetaItem
                  label="教授からの指示"
                  value={result.professorInstructions}
                />
              ) : null}
              {result.requiredKeywords.length > 0 ? (
                <MetaItem
                  label="必須キーワード"
                  value={result.requiredKeywords.join("、")}
                />
              ) : null}
            </dl>
          </ResultCard>

          <ResultCard>
            <SectionHeading>構成</SectionHeading>
            <ol className="mt-8 space-y-4">
              {OUTLINE_SECTIONS.map((section, index) => (
                <li key={section.key} className="outline-item">
                  <div className="flex items-start gap-4">
                    <span className="outline-number">{index + 1}</span>
                    <div>
                      <span className="text-[16px] font-semibold text-black">
                        {section.label}
                      </span>
                      <p className="mt-3 text-[15px] leading-[1.75] text-neutral-600">
                        {result.outline[section.key]}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {!result.body ? (
              <div className="mt-10 flex flex-col items-center gap-4 border-t border-black/[0.06] pt-10">
                <button
                  type="button"
                  onClick={handleGenerateBody}
                  disabled={isGeneratingBody || !mounted || isLimitReached}
                  className="btn-primary"
                >
                  この構成から本文を生成
                </button>
                {bodyError ? (
                  <p className="alert-message w-full">{bodyError}</p>
                ) : null}
              </div>
            ) : null}
          </ResultCard>

          {result.body ? (
            <ResultCard>
              <div className="flex flex-col gap-6">
                <SectionHeading>本文</SectionHeading>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <ExportButton onClick={handleCopyBody} disabled={isExporting}>
                    {copyLabel}
                  </ExportButton>
                  <ExportButton
                    onClick={handleDownloadDocx}
                    disabled={isExporting}
                  >
                    {isDownloadingDocx ? "ダウンロード中…" : "Word (.docx)"}
                  </ExportButton>
                  <ExportButton
                    onClick={handleDownloadPdf}
                    disabled={isExporting}
                  >
                    {isDownloadingPdf ? "ダウンロード中…" : "PDF"}
                  </ExportButton>
                </div>
              </div>

              <div className="body-preview mt-8">
                <pre className="whitespace-pre-wrap font-sans text-[15px] leading-[1.85] text-neutral-800">
                  {result.body}
                </pre>
              </div>

              <div className="mt-10 flex flex-col items-center gap-4 border-t border-black/[0.06] pt-10">
                <button
                  type="button"
                  onClick={handleGenerateBody}
                  disabled={isGeneratingBody || !mounted || isLimitReached}
                  className="btn-secondary-lg"
                >
                  本文を再生成
                </button>
                {bodyError ? (
                  <p className="alert-message w-full">{bodyError}</p>
                ) : null}
              </div>
            </ResultCard>
          ) : null}
        </div>

        <div className="mt-14 flex justify-center">
          <Link href="/generate" className="btn-primary">
            別のテーマで作成
          </Link>
        </div>
      </main>
    </div>
  );
}
