import { LOCALES, type Locale } from "@/lib/i18n";

export function getPreferredLocale(): Locale {
  if (typeof window === "undefined") return "en";

  const saved = window.localStorage.getItem("mycelium-locale");
  if (saved && LOCALES.includes(saved as Locale)) return saved as Locale;

  const browserLang = window.navigator.language.slice(0, 2);
  if (LOCALES.includes(browserLang as Locale)) return browserLang as Locale;

  return "en";
}
