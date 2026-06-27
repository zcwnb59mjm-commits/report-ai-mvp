import OpenAI, {
  APIConnectionError,
  AuthenticationError,
  RateLimitError,
} from "openai";
import { NextResponse } from "next/server";

import type { ReportGenerateResult } from "@/lib/report";

const MODEL = "gpt-5-mini";

const REPORT_JSON_SCHEMA = {
  type: "object",
  properties: {
    outline: {
      type: "object",
      properties: {
        introduction: {
          type: "string",
          description: "はじめにの執筆方針・含める内容",
        },
        body1: {
          type: "string",
          description: "本論①の執筆方針・論点",
        },
        body2: {
          type: "string",
          description: "本論②の執筆方針・論点",
        },
        discussion: {
          type: "string",
          description: "考察の執筆方針・深掘りポイント",
        },
        conclusion: {
          type: "string",
          description: "まとめの執筆方針・結論の方向性",
        },
      },
      required: ["introduction", "body1", "body2", "discussion", "conclusion"],
      additionalProperties: false,
    },
  },
  required: ["outline"],
  additionalProperties: false,
} as const;

type GenerateRequestBody = {
  theme?: unknown;
  wordCount?: unknown;
  courseName?: unknown;
  submissionFormat?: unknown;
};

type ParsedReportContent = Pick<ReportGenerateResult, "outline">;

function parseRequestBody(body: GenerateRequestBody) {
  const theme = typeof body.theme === "string" ? body.theme.trim() : "";
  const courseName =
    typeof body.courseName === "string" ? body.courseName.trim() : "";
  const submissionFormat =
    typeof body.submissionFormat === "string"
      ? body.submissionFormat.trim()
      : "";
  const wordCount =
    typeof body.wordCount === "number"
      ? body.wordCount
      : typeof body.wordCount === "string"
        ? Number(body.wordCount)
        : NaN;

  if (!theme) {
    return { error: "レポートテーマを入力してください。" };
  }

  if (!courseName) {
    return { error: "授業名を入力してください。" };
  }

  if (!submissionFormat) {
    return { error: "提出形式を選択してください。" };
  }

  if (!Number.isFinite(wordCount) || wordCount < 500 || wordCount > 20000) {
    return { error: "文字数は500〜20000の範囲で入力してください。" };
  }

  return {
    data: {
      theme,
      wordCount: Math.round(wordCount),
      courseName,
      submissionFormat,
    },
  };
}

function parseReportContent(raw: string): ParsedReportContent {
  const parsed = JSON.parse(raw) as ParsedReportContent;

  if (
    !parsed.outline ||
    typeof parsed.outline.introduction !== "string" ||
    typeof parsed.outline.body1 !== "string" ||
    typeof parsed.outline.body2 !== "string" ||
    typeof parsed.outline.discussion !== "string" ||
    typeof parsed.outline.conclusion !== "string"
  ) {
    throw new Error("Invalid report content shape");
  }

  return parsed;
}

function getOpenAIErrorMessage(error: unknown): string {
  if (error instanceof AuthenticationError) {
    return "OpenAI APIキーが無効です。OPENAI_API_KEY を確認してください。";
  }

  if (error instanceof RateLimitError) {
    const code =
      typeof error.error === "object" &&
      error.error !== null &&
      "code" in error.error &&
      typeof error.error.code === "string"
        ? error.error.code
        : null;

    if (code === "insufficient_quota") {
      return "OpenAI APIの利用上限に達しています。Billing設定でクレジットを追加してください。";
    }

    return "OpenAI APIのリクエスト制限に達しました。時間をおいて再度お試しください。";
  }

  if (error instanceof APIConnectionError) {
    return "OpenAI APIへの接続に失敗しました。ネットワークを確認してください。";
  }

  return "レポート構成の生成に失敗しました。時間をおいて再度お試しください。";
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY が設定されていません。" },
      { status: 500 },
    );
  }

  let body: GenerateRequestBody;

  try {
    body = (await request.json()) as GenerateRequestBody;
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が正しくありません。" },
      { status: 400 },
    );
  }

  const parsedRequest = parseRequestBody(body);

  if ("error" in parsedRequest) {
    return NextResponse.json({ error: parsedRequest.error }, { status: 400 });
  }

  const { theme, wordCount, courseName, submissionFormat } = parsedRequest.data;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.responses.create({
      model: MODEL,
      reasoning: { effort: "low" },
      instructions: [
        "あなたは大学生向けレポート作成アシスタントです。",
        "指定されたテーマ・文字数・授業名・提出形式に合わせて、論理的なレポート構成案を日本語で作成してください。",
        "各セクションは具体的な執筆方針を1〜3文で記述してください。",
        "提出形式に応じた分量配分や書き方の方針も反映してください。",
      ].join("\n"),
      input: [
        "以下の条件でレポート構成案を作成してください。",
        "",
        `レポートテーマ: ${theme}`,
        `文字数: ${wordCount}字`,
        `授業名: ${courseName}`,
        `提出形式: ${submissionFormat}`,
      ].join("\n"),
      text: {
        format: {
          type: "json_schema",
          name: "report_outline",
          strict: true,
          schema: REPORT_JSON_SCHEMA,
        },
      },
    });

    const content = response.output_text;

    if (!content) {
      throw new Error("Empty model response");
    }

    const reportContent = parseReportContent(content);

    const result: ReportGenerateResult = {
      theme,
      wordCount,
      courseName,
      submissionFormat,
      ...reportContent,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to generate report outline:", error);

    return NextResponse.json(
      { error: getOpenAIErrorMessage(error) },
      { status: 500 },
    );
  }
}
