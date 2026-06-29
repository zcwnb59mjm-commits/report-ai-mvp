import Link from "next/link";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE_NAME } from "@/lib/site";

type LegalPageShellProps = {
  title: string;
  description?: string;
  updatedAt: string;
  children: ReactNode;
};

export function LegalPageShell({
  title,
  description,
  updatedAt,
  children,
}: LegalPageShellProps) {
  return (
    <div className="page-shell">
      <SiteHeader homeHref="/" showAuth={false} />

      <main className="page-main-wide">
        <div className="mb-10 space-y-4">
          <Link
            href="/"
            className="inline-block text-[13px] text-neutral-500 transition-colors hover:text-black"
          >
            ← {SITE_NAME} トップへ
          </Link>
          <div>
            <p className="page-eyebrow">Legal</p>
            <h1 className="page-title">{title}</h1>
            {description ? (
              <p className="page-description">{description}</p>
            ) : null}
            <p className="mt-4 text-[13px] text-neutral-400">
              最終更新日: {updatedAt}
            </p>
          </div>
        </div>

        <article className="legal-document">{children}</article>
      </main>

      <SiteFooter />
    </div>
  );
}
