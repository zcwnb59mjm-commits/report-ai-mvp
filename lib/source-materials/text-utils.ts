import {
  SOURCE_MATERIAL_MAX_TEXT_LENGTH,
  type SourceMaterialFileType,
} from "@/lib/source-materials/constants";

export type ExtractedSourceMaterial = {
  type: SourceMaterialFileType;
  label: string;
  content: string;
};

export function normalizeExtractedText(text: string): string {
  return text.replace(/\u0000/g, "").replace(/\r\n/g, "\n").trim();
}

export function truncateExtractedText(text: string): string {
  if (text.length <= SOURCE_MATERIAL_MAX_TEXT_LENGTH) {
    return text;
  }

  return `${text.slice(0, SOURCE_MATERIAL_MAX_TEXT_LENGTH)}\n\n（以降は文字数上限のため省略）`;
}

export function finalizeExtractedText(text: string): string {
  const normalized = normalizeExtractedText(text);

  if (!normalized) {
    throw new Error("資料からテキストを抽出できませんでした。");
  }

  return truncateExtractedText(normalized);
}
