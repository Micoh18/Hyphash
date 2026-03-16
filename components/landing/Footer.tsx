"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { LanguageSwitcher } from "@/components/nav/LanguageSwitcher";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Col 1: Brand */}
          <div className="md:col-span-1">
            <span className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
              {t("common.mycelium")}
            </span>
            <p className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {t("common.tagline")}
            </p>
            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
              {t("footer.product")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/map" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("nav.explore_map")}
                </Link>
              </li>
              <li>
                <Link href="/feed" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("nav.feed")}
                </Link>
              </li>
              <li>
                <Link href="/observe" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("nav.new_observation")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
              {t("footer.resources")}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/mycelium-network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  {t("footer.github")}
                </a>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Community */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
              {t("footer.community")}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/mycelium-network/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  {t("footer.discussions")}
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/mycelium-network/contributing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  {t("footer.contributing")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-400">
            {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400">
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
