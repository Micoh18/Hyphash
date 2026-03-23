"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export function ConnectWallet() {
  const { user, profile, signOut } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/profile/${user.id}`}
          className="bg-[var(--card)]/90 backdrop-blur px-3 py-2 rounded-xl shadow-sm border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          {profile?.username ?? user.email?.split("@")[0] ?? "Profile"}
        </Link>
        <button
          onClick={signOut}
          className="bg-[var(--card)]/90 backdrop-blur p-2 rounded-xl shadow-sm border border-[var(--border)] text-[var(--muted-foreground)] hover:text-red-500 hover:bg-[var(--muted)] transition-colors"
          title="Sign out"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="bg-[var(--card)]/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
    >
      Sign In
    </Link>
  );
}
