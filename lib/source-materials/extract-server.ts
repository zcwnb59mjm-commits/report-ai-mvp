import mammoth from "mammoth";

import {
  getSourceMaterialTypeFromFilename,
  SOURCE_MATERIAL_MAX_FILE_SIZE_BYTES,
} from "@/lib/source-materials/constants";
import {
  finalizeExtractedText,
  normalizeExtractedText,
  type ExtractedSourceMaterial,
} from "@/lib/source-materials/text-utils";

async function extractDocxText(buffer: Buffer): Promise<string> {
  const parsed = await mammoth.extractRawText({ buffer });
  return normalizeExtractedText(parsed.value);
}

export async function extractDocxMaterialFromBuffer(
  buffer: Buffer,
  label: string,
): Promise<ExtractedSourceMaterial> {
  const raw = await extractDocxText(buffer);

  return {
    type: "docx",
    label,
    content: finalizeExtractedText(raw),
  };
}

export function validateUploadedFile(file: File): string | null {
  if (file.size === 0) {
    return "空のファイルはアップロードできません。";
  }

  if (file.size > SOURCE_MATERIAL_MAX_FILE_SIZE_BYTES) {
    return "ファイルサイズは10MB以下にしてください。";
  }

  const type = getSourceMaterialTypeFromFilename(file.name);

  if (type !== "docx") {
    return "docx ファイルのみサーバーで処理できます。";
  }

  return null;
}
