import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

import {
  SOURCE_MATERIAL_MAX_TEXT_LENGTH,
  type SourceMaterialFileType,
} from "@/lib/source-materials/constants";

function normalizeExtractedText(text: string): string {
  return text.replace(/\u0000/g, "").replace(/\r\n/g, "\n").trim();
}

function truncateText(text: string): string {
  if (text.length <= SOURCE_MATERIAL_MAX_TEXT_LENGTH) {
    return text;
  }

  return `${text.slice(0, SOURCE_MATERIAL_MAX_TEXT_LENGTH)}\n\n（以降は文字数上限のため省略）`;
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return normalizeExtractedText(result.text);
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const parsed = await mammoth.extractRawText({ buffer });
  return normalizeExtractedText(parsed.value);
}

function extractPlainText(buffer: Buffer): string {
  return normalizeExtractedText(buffer.toString("utf-8"));
}

export async function extractSourceMaterialText(
  buffer: Buffer,
  type: SourceMaterialFileType,
): Promise<string> {
  let text: string;

  switch (type) {
    case "pdf":
      text = await extractPdfText(buffer);
      break;
    case "docx":
      text = await extractDocxText(buffer);
      break;
    case "text":
      text = extractPlainText(buffer);
      break;
    default:
      throw new Error("Unsupported file type.");
  }

  if (!text) {
    throw new Error("資料からテキストを抽出できませんでした。");
  }

  return truncateText(text);
}
