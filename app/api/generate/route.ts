import OpenAI, {
  APIConnectionError,
  AuthenticationError,
  RateLimitError,
} from "openai";
import { NextResponse } from "next/server";

import { getOpenAIApiKey } from "@/lib/openai-api-key";
import {
  buildOutlineInput,
  buildOutlineInstructions,
  OUTLINE_JSON_SCHEMA_DESCRIPTIONS,
  parseReportGenerationInput,
} from "@/lib/report-generation";
import type { ReportGenerateResult } from "@/lib/report";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MODEL = "gpt-5-mini";

const REPORT_JSON_SCHEMA = {
  type: "object",
  properties: {
    outline: {
      type: "object",
      properties: {
        introduction: {
          type: "string",
          description: OUTLINE_JSON_SCHEMA_DESCRIPTIONS.introduction,
        },
        body1: {
          type: "string",
          description: OUTLINE_JSON_SCHEMA_DESCRIPTIONS.body1,
        },
        body2: {
          type: "string",
          description: OUTLINE_JSON_SCHEMA_DESCRIPTIONS.body2,
        },
        discussion: {
          type: "string",
          description: OUTLINE_JSON_SCHEMA_DESCRIPTIONS.discussion,
        },
        conclusion: {
          type: "string",
          description: OUTLINE_JSON_SCHEMA_DESCRIPTIONS.conclusion,
        },
      },
      required: ["introduction", "body1", "body2", "discussion", "conclusion"],
      additionalProperties: false,
    },
  },
  required: ["outline"],
  additionalProperties: false,
} as const;

type ParsedReportContent = Pick<ReportGenerateResult, "outline">;

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

  const parsedRequest = parseReportGenerationInput(body);

  if ("error" in parsedRequest) {
    return NextResponse.json({ error: parsedRequest.error }, { status: 400 });
  }

  const input = parsedRequest.data;

  const openai = new OpenAI({
    apiKey,
  });

  try {
    const response = await openai.responses.create({
      model: MODEL,
      reasoning: { effort: "low" },
      instructions: buildOutlineInstructions(),
      input: buildOutlineInput(input),
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
      ...input,
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
