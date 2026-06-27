"use client";

import { signIn, signOut, useSession } from "next-auth/react";

type AuthButtonProps = {
  compact?: boolean;
};

export function AuthButton({ compact = false }: AuthButtonProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span
        className="inline-block h-9 w-24 rounded-full bg-neutral-100"
        aria-hidden="true"
      />
    );
  }

  if (session?.user) {
    return (
      <div
        className={
          compact
            ? "flex flex-col items-end gap-2 sm:flex-row sm:items-center"
            : "flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
        }
      >
        <span className="text-[13px] text-neutral-500">
          {session.user.name ?? session.user.email}
        </span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="btn-secondary px-4 py-2 text-[13px]"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/generate" })}
      className="btn-secondary px-4 py-2 text-[13px]"
    >
      Googleでログイン
    </button>
  );
}
