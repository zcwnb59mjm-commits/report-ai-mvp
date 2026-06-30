"use client";

import { useRef, useState } from "react";

import { extractSourceMaterialFromFile } from "@/lib/source-materials/client/extract-material";
import {
  SOURCE_MATERIAL_ACCEPT,
  SOURCE_MATERIAL_MAX_FILE_SIZE_BYTES,
  getSourceMaterialTypeFromFile,
} from "@/lib/source-materials/constants";
import type { SourceMaterial } from "@/lib/report-generation";
import { FieldLabel } from "@/components/field-label";

type MaterialUploadProps = {
  disabled?: boolean;
  value: SourceMaterial | null;
  onChange: (material: SourceMaterial | null) => void;
  onExtractingChange?: (isExtracting: boolean) => void;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatClientError(error: unknown): string {
  if (error instanceof DOMException) {
    return "資料の読み込みに失敗しました。ファイル形式を確認して再度お試しください。";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "資料の読み込みに失敗しました。";
}

export function MaterialUpload({
  disabled = false,
  value,
  onChange,
  onExtractingChange,
}: MaterialUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(
    value?.label ?? null,
  );

  async function handleFileChange(file: File | null) {
    setErrorMessage(null);

    if (!file) {
      setSelectedFileName(null);
      onChange(null);
      return;
    }

    if (file.size > SOURCE_MATERIAL_MAX_FILE_SIZE_BYTES) {
      setErrorMessage("ファイルサイズは10MB以下にしてください。");
      setSelectedFileName(null);
      onChange(null);
      return;
    }

    if (!getSourceMaterialTypeFromFile(file)) {
      setErrorMessage("対応形式は PDF、txt、docx のみです。");
      setSelectedFileName(null);
      onChange(null);
      return;
    }

    setSelectedFileName(file.name);
    setIsExtracting(true);
    onExtractingChange?.(true);

    try {
      const material = await extractSourceMaterialFromFile(file);
      onChange(material);
    } catch (error) {
      setSelectedFileName(null);
      onChange(null);
      setErrorMessage(formatClientError(error));
    } finally {
      setIsExtracting(false);
      onExtractingChange?.(false);
    }
  }

  function handleClear() {
    setErrorMessage(null);
    setSelectedFileName(null);
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div>
      <FieldLabel htmlFor="sourceMaterial" optional>
        資料をアップロード
      </FieldLabel>

      <div className="rounded-2xl border border-dashed border-black/[0.12] bg-white px-5 py-6">
        <input
          ref={inputRef}
          id="sourceMaterial"
          name="sourceMaterial"
          type="file"
          accept={SOURCE_MATERIAL_ACCEPT}
          disabled={disabled || isExtracting}
          className="block w-full text-[14px] text-neutral-600 file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-white hover:file:bg-neutral-800 disabled:opacity-50"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            void handleFileChange(file);
          }}
        />

        {selectedFileName ? (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-black/[0.06] bg-[#fafafa] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[14px] font-medium text-black">
                {selectedFileName}
              </p>
              <p className="mt-1 text-[13px] text-neutral-500">
                {isExtracting
                  ? "テキストを抽出しています..."
                  : value
                    ? `抽出完了（${value.content.length.toLocaleString()}文字）`
                    : "読み込み中..."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled || isExtracting}
              className="btn-secondary px-4 py-2 text-[13px]"
            >
              削除
            </button>
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-[14px] leading-relaxed text-neutral-500">
        PDF、txt、docx に対応（{formatFileSize(SOURCE_MATERIAL_MAX_FILE_SIZE_BYTES)}
        まで）。アップロードした資料の内容を参考に構成案を作成します。
      </p>

      {errorMessage ? (
        <p className="alert-message mt-4">{errorMessage}</p>
      ) : null}
    </div>
  );
}
