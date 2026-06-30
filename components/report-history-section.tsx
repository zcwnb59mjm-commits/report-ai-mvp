"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getReportLevelLabel,
  getWritingStyleLabel,
} from "@/lib/report-generation";
import { formatReportContentForCopy } from "@/lib/report-history/content";
import type {
  ReportHistoryDetail,
  ReportHistoryListItem,
} from "@/lib/report-history/types";
import { OUTLINE_SECTIONS } from "@/lib/report";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function HistoryMetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="meta-label">{label}</dt>
      <dd className="meta-value">{value}</dd>
    </div>
  );
}

export function ReportHistorySection() {
  const [histories, setHistories] = useState<ReportHistoryListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ReportHistoryDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("再コピー");

  const loadHistories = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/user/report-history", {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        histories?: ReportHistoryListItem[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "作成履歴の取得に失敗しました。");
      }

      setHistories(data.histories ?? []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "作成履歴の取得に失敗しました。",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistories();
  }, [loadHistories]);

  async function handleSelectHistory(id: string) {
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedDetail(null);
      return;
    }

    setSelectedId(id);
    setDetailLoading(true);
    setErrorMessage(null);
    setCopyLabel("再コピー");

    try {
      const response = await fetch(`/api/user/report-history/${id}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        history?: ReportHistoryDetail;
        error?: string;
      };

      if (!response.ok || !data.history) {
        throw new Error(data.error ?? "作成履歴の取得に失敗しました。");
      }

      setSelectedDetail(data.history);
    } catch (error) {
      setSelectedId(null);
      setSelectedDetail(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "作成履歴の取得に失敗しました。",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCopy() {
    if (!selectedDetail) return;

    try {
      await navigator.clipboard.writeText(
        formatReportContentForCopy(selectedDetail.generatedContent),
      );
      setCopyLabel("コピーしました");
      setTimeout(() => setCopyLabel("再コピー"), 2000);
    } catch {
      setErrorMessage("クリップボードへのコピーに失敗しました。");
    }
  }

  return (
    <section className="card space-y-5">
      <div>
        <p className="text-[13px] font-semibold tracking-wide text-neutral-400">
          作成履歴
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
          ログイン中に作成したレポートの履歴です。
        </p>
      </div>

      {loading ? (
        <p className="text-[14px] text-neutral-500">読み込み中...</p>
      ) : histories.length === 0 ? (
        <p className="text-[14px] text-neutral-500">
          まだ作成履歴はありません。
        </p>
      ) : (
        <ul className="space-y-3">
          {histories.map((history) => {
            const isSelected = selectedId === history.id;

            return (
              <li key={history.id}>
                <button
                  type="button"
                  onClick={() => {
                    void handleSelectHistory(history.id);
                  }}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                    isSelected
                      ? "border-black bg-white"
                      : "border-black/[0.06] bg-[#fafafa] hover:border-black/15"
                  }`}
                >
                  <p className="text-[15px] font-semibold text-black">
                    {history.reportTheme}
                  </p>
                  <p className="mt-2 text-[13px] text-neutral-500">
                    {formatDate(history.createdAt)} · {history.wordCount.toLocaleString()}
                    字 · {history.hasBody ? "本文あり" : "構成のみ"}
                  </p>
                </button>

                {isSelected ? (
                  <div className="mt-4 space-y-6 rounded-2xl border border-black/[0.06] bg-white p-5">
                    {detailLoading || !selectedDetail ? (
                      <p className="text-[14px] text-neutral-500">詳細を読み込み中...</p>
                    ) : (
                      <>
                        <dl className="grid gap-6 sm:grid-cols-2">
                          <HistoryMetaItem
                            label="レポートテーマ"
                            value={selectedDetail.reportTheme}
                          />
                          <HistoryMetaItem
                            label="文字数"
                            value={`${selectedDetail.wordCount.toLocaleString()}字`}
                          />
                          <HistoryMetaItem
                            label="授業名"
                            value={selectedDetail.className}
                          />
                          <HistoryMetaItem
                            label="提出形式"
                            value={selectedDetail.format}
                          />
                          <HistoryMetaItem
                            label="文体"
                            value={getWritingStyleLabel(
                              selectedDetail.tone as "desu-masu" | "dearu",
                            )}
                          />
                          <HistoryMetaItem
                            label="レポートレベル"
                            value={getReportLevelLabel(
                              selectedDetail.level as
                                | "standard"
                                | "high-grade"
                                | "human-like",
                            )}
                          />
                          {selectedDetail.uploadedFileName ? (
                            <HistoryMetaItem
                              label="参考資料"
                              value={selectedDetail.uploadedFileName}
                            />
                          ) : null}
                          <HistoryMetaItem
                            label="作成日時"
                            value={formatDate(selectedDetail.createdAt)}
                          />
                        </dl>

                        <div>
                          <p className="text-[13px] font-semibold tracking-wide text-neutral-400">
                            構成
                          </p>
                          <ol className="mt-4 space-y-3">
                            {OUTLINE_SECTIONS.map((section) => (
                              <li
                                key={section.key}
                                className="rounded-2xl border border-black/[0.06] bg-[#fafafa] p-4"
                              >
                                <p className="text-[14px] font-semibold text-black">
                                  {section.label}
                                </p>
                                <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">
                                  {
                                    selectedDetail.generatedContent.outline[
                                      section.key
                                    ]
                                  }
                                </p>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {selectedDetail.generatedContent.body ? (
                          <div>
                            <p className="text-[13px] font-semibold tracking-wide text-neutral-400">
                              本文
                            </p>
                            <div className="body-preview mt-4">
                              <pre className="whitespace-pre-wrap font-sans text-[14px] leading-[1.85] text-neutral-800">
                                {selectedDetail.generatedContent.body}
                              </pre>
                            </div>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => {
                            void handleCopy();
                          }}
                          className="btn-secondary px-6 py-3 text-[14px]"
                        >
                          {copyLabel}
                        </button>
                      </>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {errorMessage ? <p className="alert-message">{errorMessage}</p> : null}
    </section>
  );
}
