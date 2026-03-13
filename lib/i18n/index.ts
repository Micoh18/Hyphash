export { en, type TranslationKey } from "./translations/en";
export { es } from "./translations/es";
export { pt } from "./translations/pt";
export { ru } from "./translations/ru";

export const LOCALES = ["en", "es", "pt", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
  ru: "Русский",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  pt: "🇧🇷",
  ru: "🇷🇺",
};
