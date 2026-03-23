"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6">
      <div className="text-center max-w-md">
        {/* Mushroom SVG */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          className="mx-auto mb-8"
        >
          <ellipse cx="60" cy="55" rx="40" ry="28" className="fill-[var(--muted)]" />
          <ellipse cx="60" cy="55" rx="40" ry="28" className="stroke-[var(--border)]" strokeWidth="2" />
          <rect x="52" y="55" width="16" height="35" rx="4" className="fill-[var(--muted)]" />
          <rect x="52" y="55" width="16" height="35" rx="4" className="stroke-[var(--border)]" strokeWidth="2" />
          <circle cx="48" cy="45" r="4" className="fill-spore/30" />
          <circle cx="68" cy="48" r="3" className="fill-spore/30" />
          <circle cx="58" cy="38" r="3.5" className="fill-spore/30" />
          <ellipse cx="60" cy="95" rx="24" ry="3" className="fill-[var(--muted)]" />
        </svg>

        <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight mb-4">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold text-[var(--foreground)] mb-3">
          {t("notfound.title")}
        </h2>
        <p className="text-[var(--muted-foreground)] mb-10 leading-relaxed">
          {t("notfound.subtitle")}
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 text-sm font-medium rounded-xl border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            {t("notfound.go_home")}
          </Link>
          <Link
            href="/map"
            className="px-6 py-3 text-sm font-medium rounded-xl bg-forest text-white hover:bg-forest-light transition-colors"
          >
            {t("notfound.go_map")}
          </Link>
        </div>
      </div>
    </div>
  );
}
