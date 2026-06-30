import OpenAI, {
  APIConnectionError,
  AuthenticationError,
  RateLimitError,
} from "openai";
import { NextResponse } from "next/server";

import { getAppUser } from "@/lib/auth/get-app-user";
import { getOpenAIApiKey } from "@/lib/openai-api-key";
import { updateReportHistoryContent } from "@/lib/report-history/server";
import {
  buildBodyDraftInput,
  buildBodyDraftInstructions,
  buildHumanizeInput,
  buildHumanizeInstructions,
  parseOutline,
  parseReportGenerationInput,
  toGenerationInputFromResult,
} from "@/lib/report-generation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MODEL = "gpt-5-mini";

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

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が正しくありません。" },
      { status: 400 },
    );
  }

  const parsedInput = parseReportGenerationInput(body);

  if ("error" in parsedInput) {
    return NextResponse.json({ error: parsedInput.error }, { status: 400 });
  }

  const outline = parseOutline(body.outline);

  if (!outline) {
    return NextResponse.json(
      { error: "レポート構成がありません。" },
      { status: 400 },
    );
  }

  const generationInput = toGenerationInputFromResult({
    ...parsedInput.data,
    outline,
  });
  const maxOutputTokens = Math.min(
    Math.round(generationInput.wordCount * 2.5),
    32000,
  );

  const openai = new OpenAI({
    apiKey,
  });

  try {
    const draftResponse = await openai.responses.create({
      model: MODEL,
      reasoning: { effort: "medium" },
      max_output_tokens: maxOutputTokens,
      instructions: buildBodyDraftInstructions(generationInput),
      input: buildBodyDraftInput(generationInput, outline),
    });

    const draftText = draftResponse.output_text?.trim();

    if (!draftText) {
      throw new Error("Empty draft response");
    }

    const humanizedResponse = await openai.responses.create({
      model: MODEL,
      reasoning: { effort: "low" },
      max_output_tokens: maxOutputTokens,
      instructions: buildHumanizeInstructions(generationInput),
      input: buildHumanizeInput(generationInput, draftText),
    });

    const bodyText = humanizedResponse.output_text?.trim();

    if (!bodyText) {
      throw new Error("Empty humanized response");
    }

    const historyId =
      typeof body.historyId === "string" ? body.historyId.trim() : "";

    if (historyId) {
      const appUser = await getAppUser();

      if (appUser) {
        await updateReportHistoryContent(appUser.prismaUser.id, historyId, {
          outline,
          body: bodyText,
        });
      }
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
