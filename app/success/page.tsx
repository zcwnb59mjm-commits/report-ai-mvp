import Link from "next/link";

const SITE_NAME = "ReportAI";

export default function SuccessPage() {
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
        <p className="page-eyebrow">登録完了</p>
        <h1 className="page-title">ご登録ありがとうございます</h1>
        <p className="page-description">
          月980円プランへの登録が完了しました。レポート作成を続けられます。
        </p>
        <div className="mt-12 flex justify-center sm:justify-start">
          <Link href="/generate" className="btn-primary">
            レポートを作成する
          </Link>
        </div>
      </main>
    </div>
  );
}
