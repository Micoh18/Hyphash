"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { useObservations } from "@/hooks/useObservations";

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

export function RecentActivity() {
  const { t } = useI18n();
  const { observations } = useObservations();

  const recent = observations.slice(0, 4);

  if (recent.length === 0) {
    return (
      <section className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeInSection>
            <div className="p-10 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                {t("landing.recent_empty")}
              </p>
              <Link
                href="/observe"
                className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
              >
                {t("landing.recent_cta")}
                <span>&rarr;</span>
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <FadeInSection>
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-12 md:mb-16 text-center">
            {t("landing.recent_title")}
          </h2>
        </FadeInSection>
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {recent.map((obs, i) => (
            <FadeInSection key={obs.id} delay={i * 0.1} className="snap-start flex-shrink-0 w-72">
              <Link href={`/observation/${obs.id}`} className="block group">
                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                  {obs.photos && obs.photos.length > 0 ? (
                    <div className="h-40 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <img
                        src={obs.photos[0].url}
                        alt={obs.proposed_species || "Observation"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-300 dark:text-neutral-600">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-medium text-neutral-900 dark:text-white text-sm truncate">
                      {obs.verified_species || obs.proposed_species || t("common.unknown_species")}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {new Date(obs.date_observed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
