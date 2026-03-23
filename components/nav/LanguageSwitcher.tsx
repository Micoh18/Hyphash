"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
import { LOCALES, LOCALE_LABELS, LOCALE_FLAGS, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors w-full"
      >
        <span>{LOCALE_FLAGS[locale]}</span>
        <span>{LOCALE_LABELS[locale]}</span>
        <svg
          className={`w-3.5 h-3.5 ml-auto transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-full bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden z-50">
          {LOCALES.map((loc: Locale) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc);
                setOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left transition-colors ${
                locale === loc
                  ? "bg-forest/10 text-forest dark:bg-forest/10 dark:text-moss-light"
                  : "text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              <span>{LOCALE_FLAGS[loc]}</span>
              <span>{LOCALE_LABELS[loc]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
