import Link from "next/link";

import { AuthButton } from "@/components/auth-button";

const SITE_NAME = "ReportAI";

type SiteHeaderProps = {
  homeHref?: string;
  showAuth?: boolean;
};

export function SiteHeader({
  homeHref = "/",
  showAuth = true,
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href={homeHref} className="site-logo">
          {SITE_NAME}
        </Link>
        {showAuth ? <AuthButton compact /> : null}
      </div>
    </header>
  );
}
