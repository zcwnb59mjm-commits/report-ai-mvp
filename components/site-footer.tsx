import Link from "next/link";

import { FOOTER_LINKS, SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/[0.06]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 py-14 sm:flex-row sm:justify-between sm:px-8">
        <p className="text-[13px] text-neutral-400">
          © {year} {SITE_NAME}
        </p>
        <nav aria-label="フッターナビゲーション">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
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
