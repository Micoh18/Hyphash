"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="text-center max-w-md"
      >
        {/* Mushroom SVG */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          className="mx-auto mb-8"
        >
          <ellipse cx="60" cy="55" rx="40" ry="28" className="fill-neutral-100 dark:fill-neutral-800" />
          <ellipse cx="60" cy="55" rx="40" ry="28" className="stroke-neutral-300 dark:stroke-neutral-600" strokeWidth="2" />
          <rect x="52" y="55" width="16" height="35" rx="4" className="fill-neutral-200 dark:fill-neutral-700" />
          <rect x="52" y="55" width="16" height="35" rx="4" className="stroke-neutral-300 dark:stroke-neutral-600" strokeWidth="2" />
          <circle cx="48" cy="45" r="4" className="fill-neutral-200 dark:fill-neutral-700" />
          <circle cx="68" cy="48" r="3" className="fill-neutral-200 dark:fill-neutral-700" />
          <circle cx="58" cy="38" r="3.5" className="fill-neutral-200 dark:fill-neutral-700" />
          <ellipse cx="60" cy="95" rx="24" ry="3" className="fill-neutral-100 dark:fill-neutral-800" />
        </svg>

        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
          {t("notfound.title")}
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-10 leading-relaxed">
          {t("notfound.subtitle")}
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 text-sm font-medium rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {t("notfound.go_home")}
          </Link>
          <Link
            href="/map"
            className="px-6 py-3 text-sm font-medium rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            {t("notfound.go_map")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
