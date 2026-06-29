import { NextResponse } from "next/server";

import {
  getSourceMaterialTypeFromFilename,
  SOURCE_MATERIAL_MAX_FILE_SIZE_BYTES,
} from "@/lib/source-materials/constants";
import { extractSourceMaterialText } from "@/lib/source-materials/extract-text";

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

  if (file.size === 0) {
    return NextResponse.json(
      { error: "空のファイルはアップロードできません。" },
      { status: 400 },
    );
  }

  if (file.size > SOURCE_MATERIAL_MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "ファイルサイズは10MB以下にしてください。" },
      { status: 400 },
    );
  }

  const type = getSourceMaterialTypeFromFilename(file.name);

  if (!type) {
    return NextResponse.json(
      { error: "対応形式は PDF、txt、docx のみです。" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const content = await extractSourceMaterialText(buffer, type);

    return NextResponse.json({
      type,
      label: file.name,
      content,
    });
  } catch (error) {
    console.error("Failed to extract source material text:", error);

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
