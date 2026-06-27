const ENV_KEY = "OPENAI_API_KEY";

export function getOpenAIApiKey(): string | undefined {
  const value = process.env[ENV_KEY];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
