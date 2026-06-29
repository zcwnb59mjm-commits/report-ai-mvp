export const SITE_NAME = "ReportAI";

export const SITE_TAGLINE = "大学生向けレポートAI";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "contact@report-ai.app";

export const FOOTER_LINKS = [
  { label: "利用規約", href: "/terms" },
  { label: "プライバシーポリシー", href: "/privacy" },
  { label: "特定商取引法に基づく表記", href: "/legal" },
] as const;
