import { NextResponse } from "next/server";

import {
  extractDocxMaterialFromBuffer,
  validateUploadedFile,
} from "@/lib/source-materials/extract-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が正しくありません。" },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "ファイルを選択してください。" },
      { status: 400 },
    );
  }

  const validationError = validateUploadedFile(file);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const material = await extractDocxMaterialFromBuffer(buffer, file.name);

    return NextResponse.json(material);
  } catch (error) {
    console.error("Failed to extract docx text:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "資料の読み込みに失敗しました。",
      },
      { status: 400 },
    );
  }
}
