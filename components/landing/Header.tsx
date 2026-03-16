"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { LanguageSwitcher } from "@/components/nav/LanguageSwitcher";

export function Header() {
  const { t } = useI18n();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          <Link href="/" className="text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 uppercase hover:text-neutral-900 dark:hover:text-white transition-colors">
            {t("common.tagline")}
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4"
        >
          <LanguageSwitcher />
          <Link
            href="/map"
            className="px-5 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {t("landing.enter_app")}
          </Link>
        </motion.div>
      </div>
    </header>
  );
}
