"use client";

import { useI18n } from "@/hooks/useI18n";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export default function PrivacyPage() {
  const { t } = useI18n();

  const sections = [
    { title: t("privacy.data_title"), body: t("privacy.data_desc") },
    { title: t("privacy.location_title"), body: t("privacy.location_desc") },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Header />

      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight mb-6">
            {t("privacy.title")}
          </h1>
          <p className="text-[var(--muted-foreground)] leading-relaxed mb-12">
            {t("privacy.intro")}
          </p>

          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                  {section.title}
                </h2>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <p className="mt-16 text-sm text-[var(--muted-foreground)]">
            {t("privacy.updated")}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
