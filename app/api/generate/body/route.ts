import OpenAI, {
  APIConnectionError,
  AuthenticationError,
  RateLimitError,
} from "openai";
import { NextResponse } from "next/server";

import { getOpenAIApiKey } from "@/lib/openai-api-key";
import { OUTLINE_SECTIONS, type ReportOutline } from "@/lib/report";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MODEL = "gpt-5-mini";

type GenerateBodyRequestBody = {
  theme?: unknown;
  wordCount?: unknown;
  courseName?: unknown;
  submissionFormat?: unknown;
  outline?: unknown;
};

function parseOutline(value: unknown): ReportOutline | null {
  if (!value || typeof value !== "object") return null;

  const outline = value as Record<string, unknown>;

  if (
    typeof outline.introduction !== "string" ||
    typeof outline.body1 !== "string" ||
    typeof outline.body2 !== "string" ||
    typeof outline.discussion !== "string" ||
    typeof outline.conclusion !== "string"
  ) {
    return null;
  }

  return {
    introduction: outline.introduction,
    body1: outline.body1,
    body2: outline.body2,
    discussion: outline.discussion,
    conclusion: outline.conclusion,
  };
}

function parseRequestBody(body: GenerateBodyRequestBody) {
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
  const outline = parseOutline(body.outline);

  if (!theme) {
    return { error: "レポートテーマがありません。" };
  }

  if (!courseName) {
    return { error: "授業名がありません。" };
  }

  if (!submissionFormat) {
    return { error: "提出形式がありません。" };
  }

  if (!Number.isFinite(wordCount) || wordCount < 500 || wordCount > 20000) {
    return { error: "文字数が不正です。" };
  }

  if (!outline) {
    return { error: "レポート構成がありません。" };
  }

  return {
    data: {
      theme,
      wordCount: Math.round(wordCount),
      courseName,
      submissionFormat,
      outline,
    },
  };
}

function formatOutlineForPrompt(outline: ReportOutline): string {
  return OUTLINE_SECTIONS.map(
    (section) => `【${section.label}】\n${outline[section.key]}`,
  ).join("\n\n");
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

  return "本文の生成に失敗しました。時間をおいて再度お試しください。";
}

export async function POST(request: Request) {
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY が設定されていません。" },
      { status: 500 },
    );
  }

  let body: GenerateBodyRequestBody;

  try {
    body = (await request.json()) as GenerateBodyRequestBody;
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

  const { theme, wordCount, courseName, submissionFormat, outline } =
    parsedRequest.data;

  const openai = new OpenAI({
    apiKey,
  });

  try {
    const response = await openai.responses.create({
      model: MODEL,
      reasoning: { effort: "low" },
      max_output_tokens: Math.min(Math.round(wordCount * 2.5), 32000),
      instructions: [
        "あなたは大学生向けレポート作成アシスタントです。",
        "指定された構成案に沿って、レポート本文を日本語で執筆してください。",
        "文体は大学生が自然に書いたような、丁寧な「です・ます調」にしてください。",
        "堅すぎる論文調や、カジュアルすぎる口語は避けてください。",
        "各セクションの見出し（はじめに、本論①、本論②、考察、まとめ）を行頭に付け、段落を空けて読みやすくしてください。",
        "指定文字数におおよそ合わせてください（±10%程度）。",
        "参考文献リストや脚注は含めないでください。",
        "本文のみを出力し、前置きや解説は不要です。",
      ].join("\n"),
      input: [
        "以下の条件と構成案に基づき、レポート本文を執筆してください。",
        "",
        `レポートテーマ: ${theme}`,
        `文字数: 約${wordCount}字`,
        `授業名: ${courseName}`,
        `提出形式: ${submissionFormat}`,
        "",
        "【構成案】",
        formatOutlineForPrompt(outline),
      ].join("\n"),
    });

    const bodyText = response.output_text?.trim();

    if (!bodyText) {
      throw new Error("Empty model response");
    }

    return NextResponse.json({ body: bodyText });
  } catch (error) {
    console.error("Failed to generate report body:", error);

    return NextResponse.json(
      { error: getOpenAIErrorMessage(error) },
      { status: 500 },
    );
  }
}
