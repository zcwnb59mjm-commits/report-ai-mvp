import type { ReportOutline } from "@/lib/report";

export type StoredReportContent = {
  outline: ReportOutline;
  body?: string;
};

export type ReportHistoryListItem = {
  id: string;
  reportTheme: string;
  wordCount: number;
  className: string;
  format: string;
  tone: string;
  level: string;
  uploadedFileName: string | null;
  hasBody: boolean;
  createdAt: string;
};

export type ReportHistoryDetail = ReportHistoryListItem & {
  generatedContent: StoredReportContent;
};
