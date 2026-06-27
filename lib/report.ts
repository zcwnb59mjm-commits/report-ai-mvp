import type {
  ReportGenerationInput,
  ReportLevel,
  SourceMaterial,
  WritingStyle,
} from "@/lib/report-generation";

export const REPORT_RESULT_STORAGE_KEY = "report-ai-result";

export type ReportOutline = {
  introduction: string;
  body1: string;
  body2: string;
  discussion: string;
  conclusion: string;
};

export type ReportGenerateResult = ReportGenerationInput & {
  outline: ReportOutline;
  body?: string;
};

export type { ReportLevel, SourceMaterial, WritingStyle };

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

export {
  REPORT_LEVELS,
  WRITING_STYLES,
} from "@/lib/report-generation";

function isWritingStyle(value: unknown): value is WritingStyle {
  return value === "desu-masu" || value === "dearu";
}

function isReportLevel(value: unknown): value is ReportLevel {
  return value === "standard" || value === "high-grade" || value === "human-like";
}

export function isReportGenerateResult(value: unknown): value is ReportGenerateResult {
  if (!value || typeof value !== "object") return false;

  const data = value as Record<string, unknown>;
  const outline = data.outline;

  if (!outline || typeof outline !== "object") return false;

  const outlineData = outline as Record<string, unknown>;

  const hasValidKeywords =
    data.requiredKeywords === undefined ||
    (Array.isArray(data.requiredKeywords) &&
      data.requiredKeywords.every((item) => typeof item === "string"));

  const hasValidSources =
    data.sourceMaterials === undefined || Array.isArray(data.sourceMaterials);

  return (
    typeof data.theme === "string" &&
    typeof data.wordCount === "number" &&
    typeof data.courseName === "string" &&
    typeof data.submissionFormat === "string" &&
    isWritingStyle(data.writingStyle) &&
    isReportLevel(data.reportLevel) &&
    (data.professorInstructions === undefined ||
      typeof data.professorInstructions === "string") &&
    hasValidKeywords &&
    hasValidSources &&
    typeof outlineData.introduction === "string" &&
    typeof outlineData.body1 === "string" &&
    typeof outlineData.body2 === "string" &&
    typeof outlineData.discussion === "string" &&
    typeof outlineData.conclusion === "string" &&
    (data.body === undefined || typeof data.body === "string")
  );
}

/** 旧データ互換: 不足フィールドにデフォルトを補完 */
export function normalizeReportGenerateResult(
  value: Record<string, unknown>,
): ReportGenerateResult | null {
  if (!isReportGenerateResult(value)) {
    const outline = value.outline;
    if (!outline || typeof outline !== "object") return null;

    const outlineData = outline as Record<string, unknown>;
    if (
      typeof value.theme !== "string" ||
      typeof value.wordCount !== "number" ||
      typeof value.courseName !== "string" ||
      typeof value.submissionFormat !== "string" ||
      typeof outlineData.introduction !== "string" ||
      typeof outlineData.body1 !== "string" ||
      typeof outlineData.body2 !== "string" ||
      typeof outlineData.discussion !== "string" ||
      typeof outlineData.conclusion !== "string"
    ) {
      return null;
    }

    return {
      theme: value.theme,
      wordCount: value.wordCount,
      courseName: value.courseName,
      submissionFormat: value.submissionFormat,
      writingStyle:
        value.submissionFormat === "論述形式" ? "dearu" : "desu-masu",
      reportLevel: "standard",
      professorInstructions: undefined,
      requiredKeywords: [],
      sourceMaterials: [],
      outline: {
        introduction: outlineData.introduction,
        body1: outlineData.body1,
        body2: outlineData.body2,
        discussion: outlineData.discussion,
        conclusion: outlineData.conclusion,
      },
      body: typeof value.body === "string" ? value.body : undefined,
    };
  }

  return {
    ...(value as ReportGenerateResult),
    requiredKeywords: (value.requiredKeywords as string[] | undefined) ?? [],
    sourceMaterials:
      (value.sourceMaterials as SourceMaterial[] | undefined) ?? [],
  };
}
