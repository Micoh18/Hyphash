"use client";

import { useI18n } from "@/hooks/useI18n";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export default function AboutPage() {
  const { t } = useI18n();

  const sections = [
    { title: t("about.mission_title"), body: [t("about.mission_p1"), t("about.mission_p2")] },
    { title: t("about.story_title"), body: [t("about.story_p1")] },
    { title: t("about.opensource_title"), body: [t("about.opensource_desc")] },
    { title: t("about.community_title"), body: [t("about.community_desc")] },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Header />

      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight mb-16">
            {t("about.title")}
          </h1>

          <div className="space-y-16">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
                  {section.title}
                </h2>
                {section.body.map((paragraph, j) => (
                  <p key={j} className="text-[var(--muted-foreground)] leading-relaxed mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
