"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthUser } from "@/hooks/use-auth-user";
import { createClient } from "@/lib/supabase/client";

type AuthButtonProps = {
  compact?: boolean;
};

export function AuthButton({ compact = false }: AuthButtonProps) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuthUser();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  if (loading) {
    return (
      <span
        className="inline-block h-9 w-24 rounded-full bg-neutral-100"
        aria-hidden="true"
      />
    );
  }

  if (isAuthenticated && user) {
    return (
      <div
        className={
          compact
            ? "flex flex-col items-end gap-2 sm:flex-row sm:items-center"
            : "flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
        }
      >
        <span className="text-[13px] text-neutral-500">
          {user.user_metadata?.full_name ?? user.email}
        </span>
        <Link href="/mypage" className="btn-secondary px-4 py-2 text-[13px]">
          マイページ
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="btn-secondary px-4 py-2 text-[13px]"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <Link href="/login" className="btn-secondary px-4 py-2 text-[13px]">
      ログイン
    </Link>
  );
}
