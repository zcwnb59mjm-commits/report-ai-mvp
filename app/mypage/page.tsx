import Link from "next/link";

import { MypageContent } from "@/components/mypage-content";
import { SiteHeader } from "@/components/site-header";

const SITE_NAME = "ReportAI";

export default function Mypage() {
  return (
    <div className="page-shell">
      <SiteHeader homeHref="/" />

      <main className="page-main">
        <div className="space-y-6 text-center sm:text-left">
          <div>
            <p className="page-eyebrow">アカウント</p>
            <h1 className="page-title">マイページ</h1>
            <p className="page-description">
              契約状況の確認やサブスクリプションの管理ができます。
            </p>
          </div>

          <MypageContent />
        </div>
      </main>

      <footer className="border-t border-black/[0.06] py-10 text-center">
        <Link href="/" className="text-[13px] text-neutral-500 hover:text-black">
          {SITE_NAME} トップへ
        </Link>
      </footer>
    </div>
  );
}
