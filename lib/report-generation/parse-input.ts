import type { ReportOutline } from "@/lib/report";

import {
  REPORT_LEVELS,
  WRITING_STYLES,
  type ReportGenerationInput,
  type ReportLevel,
  type SourceMaterial,
  type WritingStyle,
} from "./types";

type ParseResult =
  | { data: ReportGenerationInput }
  | { error: string };

function parseString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseWordCount(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return NaN;
}

function parseWritingStyle(value: unknown): WritingStyle | null {
  if (typeof value !== "string") return null;
  return WRITING_STYLES.some((item) => item.value === value)
    ? (value as WritingStyle)
    : null;
}

function parseReportLevel(value: unknown): ReportLevel | null {
  if (typeof value !== "string") return null;
  return REPORT_LEVELS.some((item) => item.value === value)
    ? (value as ReportLevel)
    : null;
}

function parseRequiredKeywords(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,、\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function parseSourceMaterials(value: unknown): SourceMaterial[] {
  if (!Array.isArray(value)) return [];

  const materials: SourceMaterial[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;

    const record = item as Record<string, unknown>;
    const type = record.type;
    const label = parseString(record.label);
    const content = parseString(record.content);

    if (
      (type !== "pdf" && type !== "text" && type !== "docx") ||
      !label ||
      !content
    )
      continue;

    materials.push({ type, label, content });
  }

  return materials;
}

export function parseReportGenerationInput(body: Record<string, unknown>): ParseResult {
  const theme = parseString(body.theme);
  const courseName = parseString(body.courseName);
  const submissionFormat = parseString(body.submissionFormat);
  const wordCount = parseWordCount(body.wordCount);
  const writingStyle = parseWritingStyle(body.writingStyle);
  const reportLevel = parseReportLevel(body.reportLevel);
  const professorInstructions = parseString(body.professorInstructions);
  const requiredKeywords = parseRequiredKeywords(body.requiredKeywords);
  const sourceMaterials = parseSourceMaterials(body.sourceMaterials);

  if (!theme) {
    return { error: "レポートテーマを入力してください。" };
  }

  if (!courseName) {
    return { error: "授業名を入力してください。" };
  }

  if (!submissionFormat) {
    return { error: "提出形式を選択してください。" };
  }

  if (!Number.isFinite(wordCount) || wordCount < 500 || wordCount > 20000) {
    return { error: "文字数は500〜20000の範囲で入力してください。" };
  }

  if (!writingStyle) {
    return { error: "文体を選択してください。" };
  }

  if (!reportLevel) {
    return { error: "レポートレベルを選択してください。" };
  }

  return {
    data: {
      theme,
      wordCount: Math.round(wordCount),
      courseName,
      submissionFormat,
      writingStyle,
      reportLevel,
      professorInstructions: professorInstructions || undefined,
      requiredKeywords,
      sourceMaterials,
    },
  };
}

export function parseOutline(value: unknown): ReportOutline | null {
  if (!value || typeof value !== "object") return null;

  const outline = value as Record<string, unknown>;

  if (
    typeof outline.introduction !== "string" ||
    typeof outline.body1 !== "string" ||
    typeof outline.body2 !== "string" ||
    typeof outline.discussion !== "string" ||
    typeof outline.conclusion !== "string"
  ) {
    return null;
  }

  return {
    introduction: outline.introduction,
    body1: outline.body1,
    body2: outline.body2,
    discussion: outline.discussion,
    conclusion: outline.conclusion,
  };
}

export function toGenerationInputFromResult(
  result: ReportGenerationInput & { outline?: ReportOutline },
): ReportGenerationInput {
  return {
    theme: result.theme,
    wordCount: result.wordCount,
    courseName: result.courseName,
    submissionFormat: result.submissionFormat,
    writingStyle: result.writingStyle,
    reportLevel: result.reportLevel,
    professorInstructions: result.professorInstructions,
    requiredKeywords: result.requiredKeywords,
    sourceMaterials: result.sourceMaterials,
  };
}
