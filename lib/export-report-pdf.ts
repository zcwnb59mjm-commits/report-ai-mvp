import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, type PDFFont, rgb } from "pdf-lib";

import { OUTLINE_SECTIONS } from "@/lib/report";
import { sanitizeReportFilename } from "@/lib/export-report-docx";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 72; // 1 inch
const LINE_HEIGHT = 1.6;

const FONT_REGULAR_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@5.2.6/japanese-400-normal.ttf";
const FONT_BOLD_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@5.2.6/japanese-700-normal.ttf";

const TITLE_SIZE = 16;
const META_SIZE = 11;
const HEADING_SIZE = 12;
const BODY_SIZE = 11;

type ExportReportPdfInput = {
  theme: string;
  courseName: string;
  body: string;
};

type FontCache = {
  regular: ArrayBuffer;
  bold: ArrayBuffer;
};

let fontCache: FontCache | null = null;

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

async function loadJapaneseFonts(): Promise<FontCache> {
  if (fontCache) return fontCache;

  const [regularResponse, boldResponse] = await Promise.all([
    fetch(FONT_REGULAR_URL),
    fetch(FONT_BOLD_URL),
  ]);

  if (!regularResponse.ok || !boldResponse.ok) {
    throw new Error("Failed to load Japanese fonts");
  }

  fontCache = {
    regular: await regularResponse.arrayBuffer(),
    bold: await boldResponse.arrayBuffer(),
  };

  return fontCache;
}

function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  let currentLine = "";

  for (const char of text) {
    const testLine = currentLine + char;
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export async function exportReportPdf({
  theme,
  courseName,
  body,
}: ExportReportPdfInput): Promise<Blob> {
  const fonts = await loadJapaneseFonts();
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const regularFont = await pdfDoc.embedFont(fonts.regular);
  const boldFont = await pdfDoc.embedFont(fonts.bold);

  const contentWidth = A4_WIDTH - MARGIN * 2;
  let page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  let y = A4_HEIGHT - MARGIN;

  const lineHeight = (size: number) => size * LINE_HEIGHT;

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) {
      page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
      y = A4_HEIGHT - MARGIN;
    }
  }

  function drawLines(
    lines: string[],
    size: number,
    font: PDFFont,
    options?: { align?: "left" | "center"; spacingAfter?: number },
  ) {
    for (const line of lines) {
      ensureSpace(lineHeight(size));
      const textWidth = font.widthOfTextAtSize(line, size);
      const x =
        options?.align === "center"
          ? (A4_WIDTH - textWidth) / 2
          : MARGIN;

      page.drawText(line, {
        x,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight(size);
    }

    y -= options?.spacingAfter ?? 0;
  }

  function drawTextBlock(
    text: string,
    size: number,
    font: PDFFont,
    options?: { align?: "left" | "center"; spacingAfter?: number },
  ) {
    drawLines(wrapText(text, font, size, contentWidth), size, font, options);
  }

  drawTextBlock(theme, TITLE_SIZE, boldFont, {
    align: "center",
    spacingAfter: 12,
  });
  drawTextBlock(`授業名：${courseName}`, META_SIZE, regularFont, {
    align: "center",
    spacingAfter: 8,
  });
  drawTextBlock(`テーマ：${theme}`, META_SIZE, regularFont, {
    align: "center",
    spacingAfter: 24,
  });

  for (const section of parseBodySections(body)) {
    if (section.label) {
      drawTextBlock(section.label, HEADING_SIZE, boldFont, {
        spacingAfter: 8,
      });
    }

    for (const paragraph of contentToParagraphs(section.content)) {
      drawTextBlock(paragraph, BODY_SIZE, regularFont, { spacingAfter: 12 });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
}

export async function downloadReportPdf(input: ExportReportPdfInput): Promise<void> {
  const blob = await exportReportPdf(input);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeReportFilename(input.theme)}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
