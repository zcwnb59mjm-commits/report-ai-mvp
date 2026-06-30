import type { ReportGenerationInput } from "@/lib/report-generation";
import type { ReportGenerateResult } from "@/lib/report";
import { prisma } from "@/lib/prisma";

import { buildStoredReportContent, parseStoredReportContent } from "./content";
import type { ReportHistoryDetail, ReportHistoryListItem } from "./types";

function toListItem(record: {
  id: string;
  reportTheme: string;
  wordCount: number;
  className: string;
  format: string;
  tone: string;
  level: string;
  uploadedFileName: string | null;
  generatedContent: string;
  createdAt: Date;
}): ReportHistoryListItem {
  const content = parseStoredReportContent(record.generatedContent);

  return {
    id: record.id,
    reportTheme: record.reportTheme,
    wordCount: record.wordCount,
    className: record.className,
    format: record.format,
    tone: record.tone,
    level: record.level,
    uploadedFileName: record.uploadedFileName,
    hasBody: Boolean(content?.body?.trim()),
    createdAt: record.createdAt.toISOString(),
  };
}

export async function createReportHistory(
  userId: string,
  input: ReportGenerationInput,
  result: Pick<ReportGenerateResult, "outline" | "body">,
) {
  const uploadedFileName = input.sourceMaterials[0]?.label ?? null;

  return prisma.reportHistory.create({
    data: {
      userId,
      reportTheme: input.theme,
      wordCount: input.wordCount,
      className: input.courseName,
      format: input.submissionFormat,
      tone: input.writingStyle,
      level: input.reportLevel,
      uploadedFileName,
      generatedContent: JSON.stringify(buildStoredReportContent(result)),
    },
  });
}

export async function updateReportHistoryContent(
  userId: string,
  historyId: string,
  result: Pick<ReportGenerateResult, "outline" | "body">,
) {
  const existing = await prisma.reportHistory.findFirst({
    where: {
      id: historyId,
      userId,
    },
  });

  if (!existing) {
    return null;
  }

  return prisma.reportHistory.update({
    where: { id: historyId },
    data: {
      generatedContent: JSON.stringify(buildStoredReportContent(result)),
    },
  });
}

export async function listReportHistoriesForUser(
  userId: string,
): Promise<ReportHistoryListItem[]> {
  const records = await prisma.reportHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return records.map(toListItem);
}

export async function getReportHistoryForUser(
  userId: string,
  historyId: string,
): Promise<ReportHistoryDetail | null> {
  const record = await prisma.reportHistory.findFirst({
    where: {
      id: historyId,
      userId,
    },
  });

  if (!record) {
    return null;
  }

  const generatedContent = parseStoredReportContent(record.generatedContent);

  if (!generatedContent) {
    return null;
  }

  return {
    ...toListItem(record),
    generatedContent,
  };
}
