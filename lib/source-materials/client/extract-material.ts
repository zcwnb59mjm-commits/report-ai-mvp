"use client";

import {
  extractDocxViaServer,
  readFileAsText,
} from "@/lib/source-materials/client/read-file";
import { extractPdfMaterialFromFile } from "@/lib/source-materials/client/extract-pdf";
import {
  getSourceMaterialTypeFromFile,
  type SourceMaterialFileType,
} from "@/lib/source-materials/constants";
import {
  finalizeExtractedText,
  type ExtractedSourceMaterial,
} from "@/lib/source-materials/text-utils";

export async function extractSourceMaterialFromFile(
  file: File,
): Promise<ExtractedSourceMaterial> {
  const type = getSourceMaterialTypeFromFile(file);

  if (!type) {
    throw new Error("対応形式は PDF、txt、docx のみです。");
  }

  switch (type) {
    case "pdf":
      return extractPdfMaterialFromFile(file);
    case "text":
      return extractTextMaterialFromFile(file);
    case "docx":
      return extractDocxViaServer(file);
    default:
      throw new Error("対応形式は PDF、txt、docx のみです。");
  }
}

async function extractTextMaterialFromFile(
  file: File,
): Promise<ExtractedSourceMaterial> {
  const raw = await readFileAsText(file);

  return {
    type: "text",
    label: file.name,
    content: finalizeExtractedText(raw),
  };
}

export type { ExtractedSourceMaterial, SourceMaterialFileType };
