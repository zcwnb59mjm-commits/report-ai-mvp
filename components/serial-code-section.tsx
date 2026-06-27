"use client";

import { SerialCodeForm } from "@/components/serial-code-form";
import { useUsageBadgeState } from "@/hooks/use-usage-badge-state";

export function SerialCodeSection() {
  const { mounted, usageState, refreshUsageState } = useUsageBadgeState();

  const isPaid =
    mounted &&
    (usageState?.mode === "lifetime" || usageState?.mode === "subscription");

  if (isPaid) {
    return null;
  }

  return (
    <section className="border-y border-black/[0.06] bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 text-center sm:px-8 sm:py-24">
        <h2 className="text-[28px] font-semibold tracking-tight text-black sm:text-4xl">
          シリアルコード入力
        </h2>
        <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-neutral-500">
          永久利用プランをお持ちの方は、こちらからコードを入力してください。
        </p>
        <div className="mt-10">
          <SerialCodeForm
            onUnlocked={() => {
              void refreshUsageState();
            }}
          />
        </div>
      </div>
    </section>
  );
}
