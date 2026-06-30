import type { ReportGenerateResult } from "@/lib/report";

import type { StoredReportContent } from "./types";

export function buildStoredReportContent(
  result: Pick<ReportGenerateResult, "outline" | "body">,
): StoredReportContent {
  return {
    outline: result.outline,
    ...(result.body ? { body: result.body } : {}),
  };
}

export function parseStoredReportContent(raw: string): StoredReportContent | null {
  try {
    const parsed = JSON.parse(raw) as StoredReportContent;
    const outline = parsed.outline;

    if (
      !outline ||
      typeof outline.introduction !== "string" ||
      typeof outline.body1 !== "string" ||
      typeof outline.body2 !== "string" ||
      typeof outline.discussion !== "string" ||
      typeof outline.conclusion !== "string"
    ) {
      return null;
    }

    return {
      outline,
      body: typeof parsed.body === "string" ? parsed.body : undefined,
    };
  } catch {
    return null;
  }
}

export function formatReportContentForCopy(content: StoredReportContent): string {
  if (content.body?.trim()) {
    return content.body.trim();
  }

  return [
    `【はじめに】\n${content.outline.introduction}`,
    `【本論①】\n${content.outline.body1}`,
    `【本論②】\n${content.outline.body2}`,
    `【考察】\n${content.outline.discussion}`,
    `【まとめ】\n${content.outline.conclusion}`,
  ].join("\n\n");
}
