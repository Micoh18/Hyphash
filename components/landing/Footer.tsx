"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { LanguageSwitcher } from "@/components/nav/LanguageSwitcher";

export function Footer() {
  const { t } = useI18n();

  const linkClass = "text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors";

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="text-lg font-bold text-[var(--foreground)] tracking-tight">
              {t("common.mycelium")}
            </span>
            <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
              {t("common.tagline")}
            </p>
            <p className="mt-4 text-sm text-[var(--muted-foreground)] leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-4">
              {t("footer.product")}
            </h4>
            <ul className="space-y-3">
              <li><Link href="/map" className={linkClass}>{t("nav.explore_map")}</Link></li>
              <li><Link href="/feed" className={linkClass}>{t("nav.feed")}</Link></li>
              <li><Link href="/observe" className={linkClass}>{t("nav.new_observation")}</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-4">
              {t("footer.resources")}
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="https://github.com/hyphash" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {t("footer.github")}
                </a>
              </li>
              <li><Link href="/privacy" className={linkClass}>{t("footer.privacy")}</Link></li>
              <li><Link href="/terms" className={linkClass}>{t("footer.terms")}</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-4">
              {t("footer.community")}
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="https://github.com/hyphash/discussions" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {t("footer.discussions")}
                </a>
              </li>
              <li>
                <a href="https://github.com/hyphash/contributing" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {t("footer.contributing")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted-foreground)]">
            {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-[var(--border)] text-[var(--muted-foreground)]">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              {t("footer.open_source_badge")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
