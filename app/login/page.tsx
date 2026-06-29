import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";

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
        <p className="page-eyebrow">有料プラン</p>
        <h1 className="page-title">メールでログイン</h1>
        <p className="page-description">
          月480円プランのご利用にはログインが必要です。メールアドレスを入力すると、Magic
          Link（ログイン用リンク）が届きます。無料利用（端末ごと3回）はログイン不要です。
        </p>
        <div className="mt-10">
          <Suspense
            fallback={
              <span
                className="inline-block h-40 w-full rounded-2xl bg-neutral-100"
                aria-hidden="true"
              />
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
