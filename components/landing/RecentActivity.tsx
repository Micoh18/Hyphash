"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { useObservations } from "@/hooks/useObservations";

export function RecentActivity() {
  const { t } = useI18n();
  const { observations } = useObservations();

  const recent = observations.slice(0, 4);

  if (recent.length === 0) {
    return (
      <section className="py-16 md:py-24 border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="p-10 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 text-[var(--muted-foreground)]">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <p className="text-[var(--muted-foreground)] mb-6">
              {t("landing.recent_empty")}
            </p>
            <Link
              href="/observe"
              className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white rounded-xl text-sm font-semibold hover:bg-forest-light transition-colors"
            >
              {t("landing.recent_cta")}
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] tracking-tight mb-8 text-center">
          {t("landing.recent_title")}
        </h2>
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory">
          {recent.map((obs) => (
            <Link key={obs.id} href={`/observation/${obs.id}`} className="block group snap-start flex-shrink-0 w-64">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-moss/40 transition-colors">
                {obs.photos && obs.photos.length > 0 ? (
                  <div className="h-36 bg-[var(--muted)] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={obs.photos[0].storage_path}
                      alt={obs.proposed_species || "Observation"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-36 bg-[var(--muted)] flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[var(--muted-foreground)] opacity-30">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
                <div className="p-3">
                  <p className="font-medium text-[var(--foreground)] text-sm truncate">
                    {obs.verified_species || obs.proposed_species || t("common.unknown_species")}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {new Date(obs.observed_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
