export const FREE_USAGE_LIMIT = 3;
export const USAGE_COUNT_STORAGE_KEY = "report-ai-usage-count";
export const USAGE_LIMIT_MESSAGE =
  "無料利用は終了しました。月980円プランに登録してください。";

function readUsageCount(): number {
  if (typeof window === "undefined") return 0;

  const raw = localStorage.getItem(USAGE_COUNT_STORAGE_KEY);
  const count = raw ? Number(raw) : 0;

  if (!Number.isFinite(count) || count < 0) return 0;
  return Math.floor(count);
}

export function getUsageCount(): number {
  return readUsageCount();
}

export function getRemainingUses(): number {
  return Math.max(FREE_USAGE_LIMIT - getUsageCount(), 0);
}

export function canUseFreeGeneration(): boolean {
  return getUsageCount() < FREE_USAGE_LIMIT;
}

export function incrementUsageCount(): void {
  if (typeof window === "undefined") return;

  const nextCount = Math.min(getUsageCount() + 1, FREE_USAGE_LIMIT);
  localStorage.setItem(USAGE_COUNT_STORAGE_KEY, String(nextCount));
}
