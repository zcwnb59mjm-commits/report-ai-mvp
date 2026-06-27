import Link from "next/link";

import { AuthButton } from "@/components/auth-button";

const SITE_NAME = "ReportAI";

export default function LoginPage() {
  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-logo">
            {SITE_NAME}
          </Link>
        </div>
      </header>

      <main className="page-main text-center sm:text-left">
        <p className="page-eyebrow">ログイン</p>
        <h1 className="page-title">Googleアカウントでログイン</h1>
        <p className="page-description">
          ログインすると、購入状態と無料利用回数を端末をまたいで管理できます。
        </p>
        <div className="mt-10">
          <AuthButton />
        </div>
      </main>
    </div>
  );
}
