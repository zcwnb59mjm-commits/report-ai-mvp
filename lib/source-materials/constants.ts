export const SOURCE_MATERIAL_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const SOURCE_MATERIAL_MAX_TEXT_LENGTH = 50_000;

export const SOURCE_MATERIAL_ACCEPT =
  ".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const SOURCE_MATERIAL_EXTENSIONS = [".pdf", ".txt", ".docx"] as const;

export type SourceMaterialFileType = "pdf" | "text" | "docx";

export function getSourceMaterialTypeFromFilename(
  filename: string,
): SourceMaterialFileType | null {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".txt")) return "text";
  if (lower.endsWith(".docx")) return "docx";

  return null;
}
