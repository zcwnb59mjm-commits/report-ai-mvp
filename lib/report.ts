export const REPORT_RESULT_STORAGE_KEY = "report-ai-result";

export type ReportOutline = {
  introduction: string;
  body1: string;
  body2: string;
  discussion: string;
  conclusion: string;
};

export type ReportGenerateResult = {
  theme: string;
  wordCount: number;
  courseName: string;
  submissionFormat: string;
  outline: ReportOutline;
  body?: string;
};

export const OUTLINE_SECTIONS = [
  { key: "introduction" as const, label: "はじめに" },
  { key: "body1" as const, label: "本論①" },
  { key: "body2" as const, label: "本論②" },
  { key: "discussion" as const, label: "考察" },
  { key: "conclusion" as const, label: "まとめ" },
] as const;

export const SUBMISSION_FORMATS = [
  "レポート（Word / PDF）",
  "レポート（手書き）",
  "論述形式",
  "プレゼン資料",
  "その他",
] as const;

export function isReportGenerateResult(value: unknown): value is ReportGenerateResult {
  if (!value || typeof value !== "object") return false;

  const data = value as Record<string, unknown>;
  const outline = data.outline;

  if (!outline || typeof outline !== "object") return false;

  const outlineData = outline as Record<string, unknown>;

  return (
    typeof data.theme === "string" &&
    typeof data.wordCount === "number" &&
    typeof data.courseName === "string" &&
    typeof data.submissionFormat === "string" &&
    typeof outlineData.introduction === "string" &&
    typeof outlineData.body1 === "string" &&
    typeof outlineData.body2 === "string" &&
    typeof outlineData.discussion === "string" &&
    typeof outlineData.conclusion === "string" &&
    (data.body === undefined || typeof data.body === "string")
  );
}
