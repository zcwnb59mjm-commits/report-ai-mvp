export {
  getReportLevelLabel,
  getWordCountRange,
  getWritingStyleLabel,
  OUTLINE_JSON_SCHEMA_DESCRIPTIONS,
  REPORT_LEVELS,
  WRITING_STYLES,
  type ReportGenerationInput,
  type ReportLevel,
  type SourceMaterial,
  type WritingStyle,
} from "./types";

export {
  parseOutline,
  parseReportGenerationInput,
  toGenerationInputFromResult,
} from "./parse-input";

export {
  buildBodyDraftInput,
  buildBodyDraftInstructions,
  buildHumanizeInput,
  buildHumanizeInstructions,
  buildOutlineInput,
  buildOutlineInstructions,
  formatOutlineForPrompt,
} from "./prompts";
