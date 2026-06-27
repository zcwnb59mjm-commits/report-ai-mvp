import { OUTLINE_SECTIONS, type ReportOutline } from "@/lib/report";

import {
  getReportLevelLabel,
  getWordCountRange,
  getWritingStyleLabel,
  type ReportGenerationInput,
  type ReportLevel,
} from "./types";

const FORBIDDEN_AI_PHRASES = [
  "まず",
  "次に",
  "最後に",
  "第一に",
  "第二に",
  "第三に",
  "結論として",
  "本レポートでは",
  "本稿では",
  "以上のことから",
  "が重要である",
  "が求められる",
  "が鍵となる",
  "不可欠である",
  "〜について述べる",
  "〜を考察していく",
  "〜を見ていく",
  "〜していく",
].join("、");

function formatOptionalSection(title: string, content?: string): string[] {
  if (!content) return [];
  return ["", `【${title}】`, content];
}

function formatKeywords(keywords: string[]): string[] {
  if (keywords.length === 0) return [];
  return ["", "【必ず含めるキーワード】", keywords.join("、")];
}

function formatSourceMaterials(
  sourceMaterials: ReportGenerationInput["sourceMaterials"],
): string[] {
  if (sourceMaterials.length === 0) return [];

  return [
    "",
    "【参考資料】",
    ...sourceMaterials.flatMap((material) => [
      `- ${material.label}（${material.type}）`,
      material.content,
    ]),
  ];
}

function formatReportLevelGuidance(level: ReportLevel): string[] {
  switch (level) {
    case "high-grade":
      return [
        "レポートレベル: 高評価",
        "- 論点の深さ、具体例の説得力、考察の独自性を高める。",
        "- 授業で高評価を得られる構成と表現を意識する。",
        "- ただしAI特有の整いすぎた文章にはしない。",
      ];
    case "human-like":
      return [
        "レポートレベル: 人間らしい",
        "- 完璧すぎる均一さを避け、大学生が書いた自然なリズムを優先する。",
        "- やや口語的すぎない範囲で、個人の視点や言い回しの幅を出す。",
        "- 内容の正確さと論理性は維持する。",
      ];
    default:
      return [
        "レポートレベル: 普通",
        "- 大学レポートとして標準的な完成度・論理構成を目指す。",
      ];
  }
}

export function formatOutlineForPrompt(outline: ReportOutline): string {
  return OUTLINE_SECTIONS.map(
    (section) => `【${section.label}】\n${outline[section.key]}`,
  ).join("\n\n");
}

function buildSharedContextLines(input: ReportGenerationInput): string[] {
  const { min, max } = getWordCountRange(input.wordCount);

  return [
    `レポートテーマ: ${input.theme}`,
    `授業名: ${input.courseName}`,
    `提出形式: ${input.submissionFormat}`,
    `目標文字数: ${input.wordCount}字（${min}〜${max}字）`,
    `文体: ${getWritingStyleLabel(input.writingStyle)}`,
    `レポートレベル: ${getReportLevelLabel(input.reportLevel)}`,
    ...formatOptionalSection("教授からの指示", input.professorInstructions),
    ...formatKeywords(input.requiredKeywords),
    ...formatSourceMaterials(input.sourceMaterials),
  ];
}

/** ① レポート構成を作成 */
export function buildOutlineInstructions(): string {
  return [
    "あなたは大学レポートの構成設計者です。",
    "テーマに最適な構成を考え、各見出しごとに書く内容を整理してください。",
    "",
    "【構成設計の要件】",
    "- テーマ・授業名・提出条件に最も適した章立てにする。",
    "- 各見出し（はじめに、本論①、本論②、考察、まとめ）ごとに、",
    "  「何を説明し」「どんな具体例を使い」「どう考察するか」を整理する。",
    "- 本論①・本論②は異なる角度から論点を深掘りし、考察で統合する。",
    "- 文字数配分の目安: はじめに10〜15%、本論①25〜30%、本論②25〜30%、考察20〜25%、まとめ10〜15%。",
    "- 必須キーワードがある場合は、自然に組み込める位置を各セクション方針に反映する。",
    "- 参考資料がある場合は、その内容を踏まえた論点設計にする。",
    "- 構成案は執筆メモとして2〜4文で具体的に書く。",
    "- AI定型句（「まず」「次に」「最後に」等）は使わない。",
  ].join("\n");
}

export function buildOutlineInput(input: ReportGenerationInput): string {
  return [
    "以下の条件で、提出可能なレポート構成案を作成してください。",
    "",
    ...buildSharedContextLines(input),
    ...formatReportLevelGuidance(input.reportLevel),
    "",
    "各見出しで書く内容（説明・具体例・考察の方向性）まで整理してください。",
  ].join("\n");
}

/** ② 本文を生成 */
export function buildBodyDraftInstructions(input: ReportGenerationInput): string {
  const { min, max } = getWordCountRange(input.wordCount);
  const styleLabel = getWritingStyleLabel(input.writingStyle);

  return [
    "あなたは大学生のレポート執筆者です。",
    "与えられた構成案に沿い、提出できる完成原稿の初稿を書いてください。",
    "",
    "【執筆要件】",
    `- 文体は「${styleLabel}」で統一する。`,
    `- 文字数は${min}字以上${max}字以下（指定${input.wordCount}字の95〜105%）に収める。`,
    "- 各セクション内で「説明 → 具体例 → 考察」の流れを意識する。",
    "- 見出しは「はじめに」「本論①」「本論②」「考察」「まとめ」をプレーンテキストの行として付ける。",
    "- 見出しと本文の間、段落間に空行を1行入れる。",
    "- Markdown記法は使わない。",
    "- 出力は完成原稿のみ。作業メモや解説は書かない。",
    ...formatReportLevelGuidance(input.reportLevel),
    "",
    "【品質】",
    "- 大学生が提出できる論理レベルを保つ。",
    "- 具体例はテーマに即したものを用い、説明だけで終わらせない。",
    "- 必須キーワードは自然な文脈で必ず含める。",
    "- 教授からの指示がある場合は優先的に反映する。",
    "- 参考資料がある場合は内容を適切に反映する。",
    "",
    "【参考文献】",
    "- 必要な場合のみ末尾に「参考文献」を付ける。",
    "- 実在が確実な文献のみ記載し、不確かな文献は書かない。",
  ].join("\n");
}

export function buildBodyDraftInput(
  input: ReportGenerationInput,
  outline: ReportOutline,
): string {
  return [
    "以下の条件と構成案に基づき、レポート本文の初稿を書いてください。",
    "",
    ...buildSharedContextLines(input),
    "",
    "【構成案】",
    formatOutlineForPrompt(outline),
    "",
    "構成案の意図を保ち、説明→具体例→考察の流れが伝わる本文にしてください。",
  ].join("\n");
}

/** ③ AIらしさ除去（内容は変えずリライト） */
export function buildHumanizeInstructions(input: ReportGenerationInput): string {
  const { min, max } = getWordCountRange(input.wordCount);
  const styleLabel = getWritingStyleLabel(input.writingStyle);

  return [
    "あなたは大学生のレポート推敲者です。",
    "渡された本文を、自然な大学生の文章へリライトしてください。",
    "",
    "【最重要ルール】",
    "- 論点・事実・具体例・結論など**内容は変更しない**。",
    "- 論理性は維持する。",
    "- 情報の追加・削除・論点の入れ替えはしない。",
    "",
    "【リライトで直すこと】",
    `- 「まず」「次に」「最後に」の多用を避け、言い換える。`,
    "- 同じ語尾を連続させない。",
    "- 文の長さをランダム化し、短い文と長い文を混ぜる。",
    "- 接続詞を言い換え、同じ接続詞の連続を避ける。",
    `- AI定型表現（${FORBIDDEN_AI_PHRASES} 等）を削除または言い換える。`,
    "- 不自然な表現、説明口調、テンプレート調を整える。",
    `- 文体を「${styleLabel}」に統一する。`,
    `- 文字数を${min}〜${max}字（指定${input.wordCount}字の95〜105%）に調整する。`,
    "- Markdown記法は使わない。",
    "",
    "【維持すること】",
    "- 見出し構成（はじめに、本論①、本論②、考察、まとめ、参考文献があればそれも）",
    "- 必須キーワードの含有",
    "- 具体例と考察の対応関係",
    "",
    "【出力】",
    "- リライト後の完成稿のみを返す。",
    "- 変更点の説明は書かない。",
  ].join("\n");
}

export function buildHumanizeInput(
  input: ReportGenerationInput,
  draft: string,
): string {
  return [
    "以下の本文を、内容を変えずに自然な大学生の文章へリライトしてください。",
    "",
    ...buildSharedContextLines(input),
    "",
    "【リライト対象の本文】",
    draft,
  ].join("\n");
}
