"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { LanguageSwitcher } from "@/components/nav/LanguageSwitcher";

export function Header() {
  const { t } = useI18n();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/95 border-b border-[var(--border)]">
      <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide text-[var(--muted-foreground)] uppercase hover:text-[var(--foreground)] transition-colors"
        >
          {t("common.tagline")}
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/map"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors"
          >
            {t("landing.enter_app")}
          </Link>
        </div>
      </div>
    </header>
  );
}
