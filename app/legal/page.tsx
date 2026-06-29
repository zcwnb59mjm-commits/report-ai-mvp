import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal-page-shell";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import { MONTHLY_PLAN_PRICE_LABEL } from "@/lib/pricing";

export const metadata: Metadata = {
  title: `特定商取引法に基づく表記 | ${SITE_NAME}`,
  description: `${SITE_NAME}の特定商取引法に基づく表記です。`,
};

const UPDATED_AT = "2026年6月29日";

export default function LegalPage() {
  return (
    <LegalPageShell
      title="特定商取引法に基づく表記"
      description="特定商取引法に基づき、本サービスに関する表示事項を記載します。"
      updatedAt={UPDATED_AT}
    >
      <section>
        <table className="legal-table">
          <tbody>
            <tr>
              <th scope="row">販売事業者名</th>
              <td>{SITE_NAME} 運営者</td>
            </tr>
            <tr>
              <th scope="row">運営責任者</th>
              <td>運営者（個人）</td>
            </tr>
            <tr>
              <th scope="row">所在地</th>
              <td>
                請求があった場合には、遅滞なく開示いたします。お問い合わせ先メールアドレスよりご連絡ください。
              </td>
            </tr>
            <tr>
              <th scope="row">電話番号</th>
              <td>
                請求があった場合には、遅滞なく開示いたします。お問い合わせはメールにて承ります。
              </td>
            </tr>
            <tr>
              <th scope="row">メールアドレス</th>
              <td>
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </td>
            </tr>
            <tr>
              <th scope="row">販売URL</th>
              <td>
                <a href="https://report-ai-mvp.vercel.app">
                  https://report-ai-mvp.vercel.app
                </a>
              </td>
            </tr>
            <tr>
              <th scope="row">販売価格</th>
              <td>
                プロプラン（有料）: {MONTHLY_PLAN_PRICE_LABEL}（税込）
                <br />
                フリープラン: 無料（3回まで）
              </td>
            </tr>
            <tr>
              <th scope="row">商品代金以外の必要料金</th>
              <td>
                インターネット接続に必要な通信料、端末費用等は利用者の負担となります。
              </td>
            </tr>
            <tr>
              <th scope="row">支払方法</th>
              <td>クレジットカード決済（Stripe）</td>
            </tr>
            <tr>
              <th scope="row">支払時期</th>
              <td>
                有料プラン申込時に初回決済が行われ、以降は1か月ごとに自動更新時に決済されます。
              </td>
            </tr>
            <tr>
              <th scope="row">サービスの提供時期</th>
              <td>決済完了後、直ちに有料プランの機能をご利用いただけます。</td>
            </tr>
            <tr>
              <th scope="row">返品・キャンセル</th>
              <td>
                デジタルコンテンツおよびサブスクリプションサービスの性質上、原則として返品・返金はお受けしておりません。解約はマイページのStripe顧客ポータル等から行えます。解約後も当該請求期間の終了までは利用可能な場合があります。法令上必要な場合はこの限りではありません。
              </td>
            </tr>
            <tr>
              <th scope="row">動作環境</th>
              <td>
                最新版の主要ブラウザ（Chrome、Safari、Edge、Firefox等）での利用を推奨します。JavaScriptおよびCookieを有効にしてください。
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>お問い合わせ</h2>
        <p>
          表記内容に関するお問い合わせ、所在地・電話番号の開示請求は、
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          までご連絡ください。
        </p>
      </section>
    </LegalPageShell>
  );
}
