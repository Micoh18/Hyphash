"use client";

import { motion } from "framer-motion";
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
    <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-950">
      <Header />

      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-6">
              {t("privacy.title")}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-12">
              {t("privacy.intro")}
            </p>
          </motion.div>

          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                  {section.title}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <p className="mt-16 text-sm text-neutral-400">
            {t("privacy.updated")}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
