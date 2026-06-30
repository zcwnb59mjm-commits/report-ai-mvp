import type { ExtractedSourceMaterial } from "@/lib/source-materials/text-utils";

export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === "function") {
    return file.arrayBuffer();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
        return;
      }

      reject(new Error("ファイルの読み込みに失敗しました。"));
    };

    reader.onerror = () => {
      reject(
        reader.error instanceof Error
          ? reader.error
          : new Error("ファイルの読み込みに失敗しました。"),
      );
    };

    reader.readAsArrayBuffer(file);
  });
}

export async function readFileAsText(file: File): Promise<string> {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("ファイルの読み込みに失敗しました。"));
    };

    reader.onerror = () => {
      reject(
        reader.error instanceof Error
          ? reader.error
          : new Error("ファイルの読み込みに失敗しました。"),
      );
    };

    reader.readAsText(file, "utf-8");
  });
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();

  if (!raw.trim()) {
    throw new Error("資料の読み込みに失敗しました。");
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("資料の読み込みに失敗しました。");
  }
}

export async function extractDocxViaServer(
  file: File,
): Promise<ExtractedSourceMaterial> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await fetch("/api/materials/extract", {
    method: "POST",
    body: formData,
  });

  const data = await parseJsonResponse<
    ExtractedSourceMaterial & { error?: string }
  >(response);

  if (!response.ok) {
    throw new Error(data.error ?? "資料の読み込みに失敗しました。");
  }

  if (!data.type || !data.label || !data.content) {
    throw new Error("資料の読み込みに失敗しました。");
  }

  return {
    type: data.type,
    label: data.label,
    content: data.content,
  };
}
