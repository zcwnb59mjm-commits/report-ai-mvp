"use client";

import { readFileAsArrayBuffer } from "@/lib/source-materials/client/read-file";
import {
  finalizeExtractedText,
  type ExtractedSourceMaterial,
} from "@/lib/source-materials/text-utils";

let pdfWorkerConfigured = false;

async function configurePdfWorker(
  pdfjs: typeof import("pdfjs-dist"),
): Promise<void> {
  if (pdfWorkerConfigured) {
    return;
  }

  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  pdfWorkerConfigured = true;
}

export async function extractPdfTextFromArrayBuffer(
  arrayBuffer: ArrayBuffer,
): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  await configurePdfWorker(pdfjs);

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const parts: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join("");

      if (pageText.trim()) {
        parts.push(pageText.trim());
      }

      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }

  return finalizeExtractedText(parts.join("\n\n"));
}

export async function extractPdfMaterialFromFile(
  file: File,
): Promise<ExtractedSourceMaterial> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const content = await extractPdfTextFromArrayBuffer(arrayBuffer);

  return {
    type: "pdf",
    label: file.name,
    content,
  };
}
