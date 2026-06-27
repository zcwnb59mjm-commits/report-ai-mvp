import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

import { OUTLINE_SECTIONS } from "@/lib/report";

const FONT_SIZE = 22; // 11pt
const TITLE_SIZE = 28; // 14pt
const FONT = {
  eastAsia: "游ゴシック",
  ascii: "Yu Gothic",
  hAnsi: "Yu Gothic",
  cs: "MS Gothic",
};

type ExportReportDocxInput = {
  theme: string;
  courseName: string;
  body: string;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseBodySections(body: string): Array<{ label: string; content: string }> {
  const labels = OUTLINE_SECTIONS.map((section) => section.label);
  const headerPattern = new RegExp(
    `^【?\\s*(${labels.map(escapeRegex).join("|")})\\s*】?\\s*$`,
    "gm",
  );
  const matches = [...body.matchAll(headerPattern)];

  if (matches.length === 0) {
    return [{ label: "", content: body.trim() }];
  }

  return matches.map((match, index) => {
    const start = match.index! + match[0].length;
    const end =
      index + 1 < matches.length ? matches[index + 1].index! : body.length;

    return {
      label: match[1],
      content: body.slice(start, end).trim(),
    };
  });
}

function contentToParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, "").trim())
    .filter(Boolean);
}

function createTextRun(text: string, options?: { bold?: boolean; size?: number }) {
  return new TextRun({
    text,
    font: FONT,
    size: options?.size ?? FONT_SIZE,
    bold: options?.bold,
  });
}

function createBodyParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 200, line: 360 },
    children: [createTextRun(text)],
  });
}

function createSectionHeading(label: string) {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    children: [createTextRun(label, { bold: true })],
  });
}

export function sanitizeReportFilename(theme: string): string {
  const sanitized = theme.replace(/[\\/:*?"<>|]/g, "_").trim();
  return sanitized || "レポート";
}

export async function exportReportDocx({
  theme,
  courseName,
  body,
}: ExportReportDocxInput): Promise<Blob> {
  const sections = parseBodySections(body);
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [createTextRun(theme, { bold: true, size: TITLE_SIZE })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [createTextRun(courseName)],
    }),
  ];

  for (const section of sections) {
    if (section.label) {
      children.push(createSectionHeading(section.label));
    }

    for (const paragraph of contentToParagraphs(section.content)) {
      children.push(createBodyParagraph(paragraph));
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: FONT_SIZE,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906,
              height: 16838,
            },
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function downloadReportDocx(input: ExportReportDocxInput): Promise<void> {
  const blob = await exportReportDocx(input);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeReportFilename(input.theme)}.docx`;
  anchor.click();
  URL.revokeObjectURL(url);
}
