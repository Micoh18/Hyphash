"use client";

import { useWallet } from "@/hooks/useWallet";
import Link from "next/link";

export function ConnectWallet() {
  const { connected, address, profile, connecting, error, connect, disconnect } =
    useWallet();

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/profile/${address}`}
          className="bg-[var(--card)]/90 backdrop-blur px-3 py-2 rounded-xl shadow-sm border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          My Observations
        </Link>
        <button
          onClick={disconnect}
          className="bg-[var(--card)]/90 backdrop-blur p-2 rounded-xl shadow-sm border border-[var(--border)] text-[var(--muted-foreground)] hover:text-red-500 hover:bg-[var(--muted)] transition-colors"
          title="Disconnect wallet"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={connect}
        disabled={connecting}
        className="bg-[var(--card)]/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
      >
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && (
        <p className="text-xs text-red-500 bg-[var(--card)]/90 backdrop-blur px-3 py-1.5 rounded-lg border border-red-200 max-w-[250px]">
          {error}
        </p>
      )}
    </div>
  );
}
