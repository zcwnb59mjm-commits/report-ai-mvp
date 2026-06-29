import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal-page-shell";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `プライバシーポリシー | ${SITE_NAME}`,
  description: `${SITE_NAME}のプライバシーポリシーです。`,
};

const UPDATED_AT = "2026年6月29日";

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="プライバシーポリシー"
      description={`${SITE_NAME}（以下「本サービス」）における個人情報等の取扱いについて定めます。`}
      updatedAt={UPDATED_AT}
    >
      <section>
        <h2>1. 基本方針</h2>
        <p>
          運営者は、本サービスの提供にあたり取得する情報を、適用法令および本ポリシーに従い、適切に取り扱います。
        </p>
      </section>

      <section>
        <h2>2. 取得する情報</h2>
        <p>本サービスでは、以下の情報を取得する場合があります。</p>
        <ul>
          <li>メールアドレス（ログイン認証、アカウント管理のため）</li>
          <li>利用ログ（生成回数、機能利用状況、エラー情報等）</li>
          <li>
            端末識別子（匿名利用枠の管理のため、ブラウザ内に保存される識別子）
          </li>
          <li>IPアドレスのハッシュ値（不正利用防止のため）</li>
          <li>入力されたレポートテーマ、字数、構成条件等（サービス提供のため）</li>
          <li>
            決済に関する情報（Stripeが処理するカード情報等。運営者はカード番号等を直接保持しません）
          </li>
          <li>Cookieおよび類似技術により取得される情報（認証状態の維持等）</li>
        </ul>
      </section>

      <section>
        <h2>3. 利用目的</h2>
        <p>取得した情報は、以下の目的で利用します。</p>
        <ul>
          <li>本サービスの提供、維持、改善</li>
          <li>利用者認証、有料プランの提供、利用回数の管理</li>
          <li>不正利用の防止、セキュリティ確保</li>
          <li>お問い合わせ対応</li>
          <li>法令に基づく対応</li>
        </ul>
      </section>

      <section>
        <h2>4. 外部サービスへの提供</h2>
        <p>
          本サービスは、機能提供のため以下の外部サービスを利用し、必要な範囲で情報を送信します。
        </p>
        <ul>
          <li>Supabase（認証・セッション管理）</li>
          <li>OpenAI（レポート構成・本文の生成）</li>
          <li>Stripe（決済処理）</li>
          <li>Neon / Vercel（データベース、ホスティング等のインフラ）</li>
        </ul>
        <p>
          各サービスの取扱いについては、各事業者のプライバシーポリシーをご確認ください。
        </p>
      </section>

      <section>
        <h2>5. 第三者提供</h2>
        <p>
          運営者は、法令に基づく場合または利用者の同意がある場合を除き、個人情報を第三者に提供しません。
        </p>
      </section>

      <section>
        <h2>6. 保管期間</h2>
        <p>
          取得した情報は、利用目的の達成に必要な期間保管し、不要となった場合は合理的な方法で削除または匿名化します。
        </p>
      </section>

      <section>
        <h2>7. 安全管理措置</h2>
        <p>
          運営者は、漏えい、滅失、毀損等を防止するため、アクセス制限、通信の暗号化、委託先の選定等、合理的な安全管理措置を講じます。
        </p>
      </section>

      <section>
        <h2>8. 利用者の権利</h2>
        <p>
          利用者は、自己の個人情報について、開示、訂正、削除等を求めることができます。ご希望の場合は、下記お問い合わせ先までご連絡ください。法令に従い、合理的な範囲で対応します。
        </p>
      </section>

      <section>
        <h2>9. Cookie等の利用</h2>
        <p>
          本サービスは、ログイン状態の維持、セキュリティ確保、サービス改善のためCookie等を利用します。ブラウザ設定によりCookieを無効化できますが、一部機能が利用できなくなる場合があります。
        </p>
      </section>

      <section>
        <h2>10. 未成年の利用</h2>
        <p>
          未成年の方が本サービスを利用する場合は、保護者の同意を得たうえでご利用ください。
        </p>
      </section>

      <section>
        <h2>11. ポリシーの変更</h2>
        <p>
          運営者は、必要に応じて本ポリシーを変更できます。変更後の内容は、本サービス上に掲示した時点から適用されます。
        </p>
      </section>

      <section>
        <h2>12. お問い合わせ</h2>
        <p>
          本ポリシーに関するお問い合わせは、以下までご連絡ください。
        </p>
        <p>
          メールアドレス:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </section>
    </LegalPageShell>
  );
}
