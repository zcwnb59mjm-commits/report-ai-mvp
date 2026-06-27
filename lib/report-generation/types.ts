/** 将来の PDF / テキスト資料取り込み用。現時点では空配列で運用。 */
export type SourceMaterial = {
  type: "pdf" | "text";
  label: string;
  content: string;
};

export const WRITING_STYLES = [
  { value: "desu-masu", label: "です・ます調" },
  { value: "dearu", label: "である調" },
] as const;

export const REPORT_LEVELS = [
  { value: "standard", label: "普通" },
  { value: "high-grade", label: "高評価" },
  { value: "human-like", label: "人間らしい" },
] as const;

export type WritingStyle = (typeof WRITING_STYLES)[number]["value"];
export type ReportLevel = (typeof REPORT_LEVELS)[number]["value"];

/** API・プロンプト生成で共通利用する入力コンテキスト */
export type ReportGenerationInput = {
  theme: string;
  wordCount: number;
  courseName: string;
  submissionFormat: string;
  writingStyle: WritingStyle;
  reportLevel: ReportLevel;
  professorInstructions?: string;
  requiredKeywords: string[];
  sourceMaterials: SourceMaterial[];
};

export function getWritingStyleLabel(style: WritingStyle): string {
  return style === "dearu" ? "である調" : "です・ます調";
}

export function getReportLevelLabel(level: ReportLevel): string {
  const found = REPORT_LEVELS.find((item) => item.value === level);
  return found?.label ?? "普通";
}

export function getWordCountRange(wordCount: number): { min: number; max: number } {
  return {
    min: Math.floor(wordCount * 0.95),
    max: Math.ceil(wordCount * 1.05),
  };
}

export const OUTLINE_JSON_SCHEMA_DESCRIPTIONS = {
  introduction:
    "はじめにで述べる論点、読者への導入、本論へつなぐ具体例の方向性、説明→具体例→考察の流れの設計",
  body1:
    "本論①の主張、説明内容、使う具体例、そこから導く考察の方向性",
  body2:
    "本論②の主張（本論①と異なる角度）、説明内容、具体例、考察の方向性",
  discussion:
    "本論①②を統合する考察、自分の解釈、限界点、授業テーマへの応答",
  conclusion: "まとめの結論、レポート全体の要点、今後の示唆",
} as const;
