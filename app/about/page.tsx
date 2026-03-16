"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  const { t } = useI18n();

  const sections = [
    { title: t("about.mission_title"), body: [t("about.mission_p1"), t("about.mission_p2")] },
    { title: t("about.story_title"), body: [t("about.story_p1")] },
    { title: t("about.opensource_title"), body: [t("about.opensource_desc")] },
    { title: t("about.community_title"), body: [t("about.community_desc")] },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-950">
      <Header />

      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-16">
              {t("about.title")}
            </h1>
          </FadeIn>

          <div className="space-y-16">
            {sections.map((section, i) => (
              <FadeIn key={section.title} delay={i * 0.08}>
                <section>
                  <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
                    {section.title}
                  </h2>
                  {section.body.map((paragraph, j) => (
                    <p key={j} className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </section>
              </FadeIn>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
