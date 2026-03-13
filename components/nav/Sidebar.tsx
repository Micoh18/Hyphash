"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useI18n } from "@/hooks/useI18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useState } from "react";
import type { TranslationKey } from "@/lib/i18n/translations/en";

const NAV_ITEMS: { href: string; labelKey: TranslationKey; icon: React.ReactNode }[] = [
  {
    href: "/map",
    labelKey: "nav.explore_map",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-13.054l6.247 3.428a.75.75 0 01.25.699V21a.75.75 0 01-1.104.662l-5.846-3.203a.75.75 0 00-.696-.01L9.882 20.7a.75.75 0 01-.714.012L2.67 17.385A.75.75 0 012.25 16.7V3.75a.75.75 0 011.104-.662l5.846 3.203a.75.75 0 00.696.01l4.476-2.247a.75.75 0 01.678-.012z" />
      </svg>
    ),
  },
  {
    href: "/feed",
    labelKey: "nav.feed",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
  },
  {
    href: "/observe",
    labelKey: "nav.new_observation",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { connected, address, profile, connecting, error, connect, disconnect } = useWallet();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-[1100] md:hidden bg-[var(--card)] border border-[var(--border)] rounded-lg p-2 shadow-sm"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {collapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
      </button>

      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/30 z-[1000] md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-[1050] w-64 bg-[var(--card)] border-r border-[var(--border)] flex flex-col transition-transform duration-200 ${
          collapsed ? "-translate-x-full" : "translate-x-0"
        } md:translate-x-0 md:static md:z-auto`}
      >
        <div className="px-5 py-5 border-b border-[var(--border)]">
          <Link href="/" className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Image src="/logo.png" alt="Mycelium" width={32} height={32} className="rounded-full" />
            {t("common.mycelium")}
          </Link>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {t("common.tagline")}
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setCollapsed(true)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {item.icon}
                {t(item.labelKey)}
              </Link>
            );
          })}

          {connected && address && (
            <Link
              href={`/profile/${address}`}
              onClick={() => setCollapsed(true)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/profile")
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {t("nav.my_observations")}
            </Link>
          )}
        </nav>

        {/* Language + Wallet */}
        <div className="px-3 py-3 border-t border-[var(--border)] space-y-3">
          <LanguageSwitcher />
          {connected ? (
            <div className="space-y-2">
              <div className="px-3 py-2 rounded-lg bg-[var(--muted)]">
                <p className="text-xs text-[var(--muted-foreground)]">{t("nav.connected")}</p>
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {profile?.username ?? `${address!.slice(0, 6)}...${address!.slice(-4)}`}
                </p>
              </div>
              <button
                onClick={disconnect}
                className="w-full px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-red-500 hover:bg-[var(--muted)] rounded-lg transition-colors text-left flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t("nav.disconnect")}
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={connect}
                disabled={connecting}
                className="w-full px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {connecting ? t("nav.connecting") : t("nav.connect_wallet")}
              </button>
              {error && (
                <p className="mt-2 text-xs text-red-500 px-1">{error}</p>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
