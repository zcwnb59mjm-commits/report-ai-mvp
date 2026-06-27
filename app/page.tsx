import Link from "next/link";

import { AuthButton } from "@/components/auth-button";
import { SerialCodeSection } from "@/components/serial-code-section";
import { MONTHLY_PLAN_PRICE_LABEL } from "@/lib/pricing";

const SITE = {
  name: "ReportAI",
  tagline: "大学生向けレポートAI",
  catchCopy: "レポート作成を、\nもっとスマートに。",
  description:
    "テーマを入力するだけで、構成から本文まで。大学生のためのAIレポートアシスタント。",
  ctaHref: "/generate",
  ctaLabel: "無料で試す",
} as const;

const PRICING = {
  freeTrial: "無料3回",
  monthlyPrice: MONTHLY_PLAN_PRICE_LABEL,
  freeNote: "クレジットカード不要",
  paidNote: "回数無制限・全機能利用可能",
} as const;

const FEATURES = [
  {
    title: "構成案を自動生成",
    description:
      "テーマと字数を入力するだけで、論理的な章立てとアウトラインを提案します。",
  },
  {
    title: "本文をワンクリック",
    description:
      "生成した構成をもとに、大学レポートに適した本文を自動で執筆します。",
  },
  {
    title: "Word / PDF出力",
    description:
      "完成したレポートをそのままダウンロード。提出形式に合わせて出力できます。",
  },
] as const;

const FOOTER_LINKS = [
  { label: "利用規約", href: "/terms" },
  { label: "プライバシーポリシー", href: "/privacy" },
  { label: "お問い合わせ", href: "/contact" },
] as const;

function LandingHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner max-w-6xl">
        <span className="site-logo">{SITE.name}</span>
        <div className="flex items-center gap-3">
          <AuthButton compact />
          <Link href={SITE.ctaHref} className="btn-secondary px-5 py-2.5 text-[13px]">
            {SITE.ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-28 pt-24 text-center sm:px-8 sm:pb-36 sm:pt-32">
      <p className="page-eyebrow">{SITE.tagline}</p>
      <h1 className="mx-auto mt-8 max-w-4xl whitespace-pre-line text-[40px] font-semibold leading-[1.05] tracking-tight text-black sm:text-[56px] sm:leading-[1.04]">
        {SITE.catchCopy}
      </h1>
      <p className="mx-auto mt-8 max-w-xl text-[17px] leading-relaxed text-neutral-500 sm:text-xl sm:leading-relaxed">
        {SITE.description}
      </p>
      <div className="mt-14 flex flex-col items-center gap-5">
        <Link href={SITE.ctaHref} className="btn-primary min-w-[240px] px-10 py-[18px] text-base">
          {SITE.ctaLabel}
        </Link>
        <p className="text-[14px] text-neutral-400">
          {PRICING.freeTrial} · {PRICING.freeNote}
        </p>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <h2 className="text-center text-[28px] font-semibold tracking-tight text-black sm:text-4xl">
        3つの特徴
      </h2>
      <ul className="mt-20 grid gap-14 sm:grid-cols-3 sm:gap-10">
        {FEATURES.map((feature, index) => (
          <li key={feature.title} className="text-center sm:text-left">
            <span className="text-[13px] font-semibold tracking-widest text-neutral-300">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-[22px] font-semibold tracking-tight text-black">
              {feature.title}
            </h3>
            <p className="mt-4 text-[16px] leading-relaxed text-neutral-500">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="border-y border-black/[0.06] bg-[#fafafa]">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-24 sm:grid-cols-2 sm:px-8 sm:py-28">
        <article className="card-white">
          <p className="text-[13px] font-semibold tracking-wide text-neutral-400">
            フリープラン
          </p>
          <p className="mt-4 text-[40px] font-semibold tracking-tight text-black">
            {PRICING.freeTrial}
          </p>
          <p className="mt-4 text-[16px] text-neutral-500">{PRICING.freeNote}</p>
        </article>
        <article className="card-white border-2 border-black">
          <p className="text-[13px] font-semibold tracking-wide text-neutral-400">
            プロプラン
          </p>
          <p className="mt-4 text-[40px] font-semibold tracking-tight text-black">
            {PRICING.monthlyPrice}
          </p>
          <p className="mt-4 text-[16px] text-neutral-500">{PRICING.paidNote}</p>
        </article>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-28 text-center sm:px-8 sm:py-36">
      <h2 className="text-[28px] font-semibold tracking-tight text-black sm:text-4xl">
        まずは無料で試してみる
      </h2>
      <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-neutral-500">
        {PRICING.freeTrial}まで、すべての機能をお試しいただけます。
      </p>
      <Link
        href={SITE.ctaHref}
        className="btn-primary mt-12 min-w-[240px] px-10 py-[18px] text-base"
      >
        {SITE.ctaLabel}
      </Link>
    </section>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/[0.06]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 py-14 sm:flex-row sm:justify-between sm:px-8">
        <p className="text-[13px] text-neutral-400">
          © {year} {SITE.name}
        </p>
        <nav aria-label="フッターナビゲーション">
          <ul className="flex flex-wrap justify-center gap-8">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[13px] text-neutral-500 transition-colors hover:text-black"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="page-shell">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <SerialCodeSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
