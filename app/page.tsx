"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { useObservations } from "@/hooks/useObservations";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { RecentActivity } from "@/components/landing/RecentActivity";
import Link from "next/link";
import type { TranslationKey } from "@/lib/i18n/translations/en";

function FadeInSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 text-left group"
      >
        <span className="text-base md:text-lg font-medium text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-1 w-5 h-5 flex items-center justify-center text-neutral-400"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 1v12M1 7h12" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden"
          >
            <p className="pt-3 text-neutral-600 dark:text-neutral-400 leading-relaxed pr-10">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const { t } = useI18n();
  const { observations } = useObservations();

  const totalObservations = observations.length;
  const verifiedCount = observations.filter(
    (o) => o.status === "community_id"
  ).length;
  const speciesSet = new Set(
    observations
      .map((o) => o.verified_species ?? o.proposed_species)
      .filter(Boolean)
  );

  const steps = [
    { number: t("landing.step1_number"), title: t("landing.step1_title"), desc: t("landing.step1_desc") },
    { number: t("landing.step2_number"), title: t("landing.step2_title"), desc: t("landing.step2_desc") },
    { number: t("landing.step3_number"), title: t("landing.step3_title"), desc: t("landing.step3_desc") },
  ];

  const features = [
    { titleKey: "landing.feature1_title" as const, descKey: "landing.feature1_desc" as const },
    { titleKey: "landing.feature2_title" as const, descKey: "landing.feature2_desc" as const },
    { titleKey: "landing.feature3_title" as const, descKey: "landing.feature3_desc" as const },
  ];

  const stats = [
    { value: totalObservations, label: t("landing.stats_observations") },
    { value: speciesSet.size, label: t("landing.stats_species") },
    { value: verifiedCount, label: t("landing.stats_community") },
  ];

  const facts = [
    { number: t("landing.fact1_number"), label: t("landing.fact1_label"), desc: t("landing.fact1_desc") },
    { number: t("landing.fact2_number"), label: t("landing.fact2_label"), desc: t("landing.fact2_desc") },
    { number: t("landing.fact3_number"), label: t("landing.fact3_label"), desc: t("landing.fact3_desc") },
  ];

  const differentiators = [
    { title: t("landing.diff1_title"), desc: t("landing.diff1_desc"), color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
    { title: t("landing.diff2_title"), desc: t("landing.diff2_desc"), color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
    { title: t("landing.diff3_title"), desc: t("landing.diff3_desc"), color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800" },
  ];

  return (
    <div className="flex flex-col bg-white dark:bg-neutral-950">
      <Header />

      {/* Hero */}
      <BackgroundPaths
        title={t("common.mycelium")}
        subtitle={t("landing.description")}
        buttonText={t("landing.enter_app")}
        buttonHref="/map"
      />

      {/* Stats bar — conditional */}
      {totalObservations >= 10 ? (
        <section className="border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <FadeInSection key={stat.label} delay={i * 0.1} className="text-center">
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </FadeInSection>
            ))}
          </div>
        </section>
      ) : (
        <section className="border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="max-w-3xl mx-auto px-6 py-14 text-center">
            <FadeInSection>
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-3">
                {t("landing.founding_title")}
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6 max-w-lg mx-auto">
                {t("landing.founding_desc")}
              </p>
              <Link
                href="/observe"
                className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
              >
                {t("landing.founding_cta")}
                <span>&rarr;</span>
              </Link>
            </FadeInSection>
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <RecentActivity />

      {/* Features */}
      <section className="py-24 md:py-32 bg-neutral-50 dark:bg-neutral-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {features.map((item, i) => (
              <FadeInSection key={item.titleKey} delay={i * 0.12}>
                <div className="group">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mb-5">
                    <div className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {t(item.descKey)}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Why Fungi Matter */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
            <FadeInSection>
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-8">
                  {t("landing.mission_title")}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-5">
                  {t("landing.mission_p1")}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {t("landing.mission_p2")}
                </p>
              </div>
            </FadeInSection>
            <div className="space-y-4">
              {facts.map((fact, i) => (
                <FadeInSection key={fact.number} delay={i * 0.1}>
                  <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                    <div className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
                      {fact.number}
                    </div>
                    <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mt-1 mb-2">
                      {fact.label}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {fact.desc}
                    </p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 md:py-32 bg-neutral-50 dark:bg-neutral-900/30">
        <div className="max-w-5xl mx-auto px-6">
          <FadeInSection>
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
                {t("landing.how_title")}
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-xl mx-auto">
                {t("landing.how_subtitle")}
              </p>
            </div>
          </FadeInSection>

          <div className="space-y-0">
            {steps.map((step, i) => (
              <FadeInSection key={step.number} delay={i * 0.1}>
                <div className="group grid md:grid-cols-[80px_1fr] gap-6 md:gap-10 py-10 border-t border-neutral-200 dark:border-neutral-800 first:border-t-0">
                  <div className="text-5xl md:text-6xl font-bold text-neutral-200 dark:text-neutral-800 group-hover:text-neutral-400 dark:group-hover:text-neutral-600 transition-colors duration-300 leading-none">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-lg">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Built Different */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInSection>
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
                {t("landing.different_title")}
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-2xl mx-auto">
                {t("landing.different_subtitle")}
              </p>
            </div>
          </FadeInSection>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {differentiators.map((item, i) => (
              <FadeInSection key={item.title} delay={i * 0.12}>
                <div className={`p-8 rounded-2xl border ${item.color}`}>
                  <h3 className="text-lg font-semibold mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed opacity-80">
                    {item.desc}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 md:py-32 bg-neutral-50 dark:bg-neutral-900/30">
        <div className="max-w-3xl mx-auto px-6">
          <FadeInSection>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-12 md:mb-16 text-center">
              {t("landing.faq_title")}
            </h2>
          </FadeInSection>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {([1, 2, 3, 4, 5] as const).map((n, i) => (
              <FadeInSection key={n} delay={i * 0.06}>
                <FAQItem
                  question={t(`landing.faq${n}_q` as TranslationKey)}
                  answer={t(`landing.faq${n}_a` as TranslationKey)}
                />
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeInSection>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-6">
              {t("landing.cta_title")}
            </h2>
            <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-10 max-w-xl mx-auto leading-relaxed">
              {t("landing.cta_desc")}
            </p>
            <Link
              href="/map"
              className="inline-flex items-center gap-3 px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl text-lg font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xl shadow-neutral-900/10 dark:shadow-white/10"
            >
              {t("landing.cta_button")}
              <span className="text-xl">&rarr;</span>
            </Link>
          </FadeInSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
