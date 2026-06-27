import { Suspense } from "react";

import { SuccessPageContent } from "@/components/success-page-content";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="page-shell">
          <main className="page-main text-center sm:text-left">
            <p className="page-eyebrow">登録確認中</p>
            <h1 className="page-title">決済を確認しています</h1>
            <p className="page-description">少々お待ちください。</p>
          </main>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
