"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { useObservations } from "@/hooks/useObservations";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { RecentActivity } from "@/components/landing/RecentActivity";
import Link from "next/link";
import type { TranslationKey } from "@/lib/i18n/translations/en";

/* ─── Spore Print Animation ─── */
/* Mimics a real esporada: dense powdery gill-lines radiating from a
   central void (where the stem sat), with varying density per "gill sector",
   irregular edges, and scattered spore particles. */

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

interface GillRay {
  id: number;
  angle: number;
  innerR: number;
  outerR: number;
  width: number;
  opacity: number;
  curve: number;
  delay: number;
}


function SporePrint() {
  const cx = 500;
  const cy = 500;
  const stemR = 50; // void where stem sat
  const gillCount = 480;

  const gills = useMemo(() => {
    // Simulate ~24 gill sectors with varying density
    const sectorCount = 24;
    const gillsArr: GillRay[] = [];

    for (let i = 0; i < gillCount; i++) {
      const r1 = seededRandom(i);
      const r2 = seededRandom(i + 1000);
      const r3 = seededRandom(i + 2000);
      const r4 = seededRandom(i + 3000);
      const r5 = seededRandom(i + 4000);

      // Which sector this gill belongs to, creates visible "gaps"
      const sector = Math.floor(i / (gillCount / sectorCount));
      const sectorAngle = (sector / sectorCount) * Math.PI * 2;
      // Jitter within sector
      const sectorWidth = (Math.PI * 2) / sectorCount;
      const angle = sectorAngle + (r1 - 0.5) * sectorWidth * 0.85;

      // Inner radius: starts just outside the stem void
      const innerR = stemR + 5 + r3 * 15;

      // Outer radius: varies per ray, some gills extend further
      const sectorReach = 0.75 + seededRandom(sector + 500) * 0.25; // each sector has different max reach
      const baseOuter = 340 * sectorReach;
      const outerR = baseOuter * (0.7 + r2 * 0.3);

      // Width: most are very fine, some are thicker (mimics spore density)
      const width = r5 < 0.85 ? 0.3 + r1 * 0.8 : 1.2 + r1 * 1.5;

      // Opacity: denser near center, fading outward, varies per gill
      const opacity = (0.2 + r2 * 0.5) * (r5 < 0.85 ? 1 : 0.6);

      // Slight curve to simulate gill curvature
      const curve = (r3 - 0.5) * 12;

      const round = (n: number, p = 4) => Number(n.toFixed(p));
      gillsArr.push({
        id: i,
        angle: round(angle, 6),
        innerR: round(innerR),
        outerR: round(outerR),
        width: round(width),
        opacity: round(opacity),
        curve: round(curve),
        delay: round(r4 * 2),
      });
    }

    return gillsArr;
  }, []);

  function gillPath(g: GillRay) {
    const cos = Math.cos(g.angle);
    const sin = Math.sin(g.angle);
    const x1 = cx + cos * g.innerR;
    const y1 = cy + sin * g.innerR;
    const x2 = cx + cos * g.outerR;
    const y2 = cy + sin * g.outerR;
    const mx = (x1 + x2) / 2 + -sin * g.curve;
    const my = (y1 + y2) / 2 + cos * g.curve;
    const r = (n: number) => n.toFixed(3);
    return `M${r(x1)},${r(y1)} Q${r(mx)},${r(my)} ${r(x2)},${r(y2)}`;
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center translate-x-[15%] sm:translate-x-[20%] md:translate-x-[25%]">
      <svg
        className="w-[min(95vw,1000px)] h-[min(95vw,1000px)]"
        viewBox="0 0 1000 1000"
        fill="none"
      >
        <title>Spore Print</title>

        {/* Gill rays */}
        {gills.map((g) => (
          <motion.path
            key={`g-${g.id}`}
            d={gillPath(g)}
            stroke="var(--foreground)"
            strokeWidth={g.width}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: g.opacity * 0.18 }}
            transition={{
              pathLength: {
                duration: 4 + g.delay * 1.2,
                delay: g.delay * 0.4,
                ease: [0.25, 0.1, 0.25, 1],
              },
              opacity: {
                duration: 1.5,
                delay: g.delay * 0.4,
                ease: "easeOut",
              },
            }}
          />
        ))}

      </svg>
    </div>
  );
}

/* ─── Landing Page ─── */
export default function LandingPage() {
  const { t } = useI18n();
  const { observations } = useObservations();

  const totalObservations = observations.length;
  const speciesSet = new Set(
    observations
      .map((o) => o.verified_species ?? o.proposed_species)
      .filter(Boolean)
  );

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <SporePrint />

        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
          <div className="max-w-xl">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--foreground)] mb-6">
              {t("common.mycelium")}
            </h1>
            <p className="text-lg md:text-xl text-[var(--muted-foreground)] leading-relaxed mb-8 max-w-md">
              {t("landing.description")}
            </p>

            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-forest text-white rounded-xl text-sm font-semibold hover:bg-forest-light transition-colors"
            >
              {t("landing.enter_app")}
              <span>&rarr;</span>
            </Link>

            {/* Stats */}
            {totalObservations > 0 && (
              <div className="flex items-center gap-6 mt-8 text-sm text-[var(--muted-foreground)]">
                <span>
                  <strong className="text-[var(--foreground)]">{totalObservations}</strong>{" "}
                  {t("landing.stats_observations")}
                </span>
                <span className="w-px h-4 bg-[var(--border)]" />
                <span>
                  <strong className="text-[var(--foreground)]">{speciesSet.size}</strong>{" "}
                  {t("landing.stats_species")}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value proposition */}
      <section className="py-16 md:py-24 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 md:gap-14">
            <div>
              <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest">
                  <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">
                {t("landing.feature1_title")}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {t("landing.feature1_desc")}
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-lg bg-mycelium/10 flex items-center justify-center mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-mycelium">
                  <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">
                {t("landing.feature2_title")}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {t("landing.feature2_desc")}
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-lg bg-spore/15 flex items-center justify-center mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-spore">
                  <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">
                {t("landing.feature3_title")}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {t("landing.feature3_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <RecentActivity />

      {/* Proof of Spore */}
      <section className="py-16 md:py-24 border-t border-[var(--border)] bg-[var(--muted)]/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mb-12 md:mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spore mb-3">
              {t("landing.pos_eyebrow")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tight mb-4">
              {t("landing.pos_title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
              {t("landing.pos_subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {([
              { n: "01", title: "landing.pos_step1_title" as TranslationKey, desc: "landing.pos_step1_desc" as TranslationKey },
              { n: "02", title: "landing.pos_step2_title" as TranslationKey, desc: "landing.pos_step2_desc" as TranslationKey },
              { n: "03", title: "landing.pos_step3_title" as TranslationKey, desc: "landing.pos_step3_desc" as TranslationKey },
            ]).map((step) => (
              <div key={step.n} className="relative pl-6 border-l-2 border-spore/30">
                <div className="text-xs font-mono font-bold text-spore mb-2 tracking-wider">
                  {step.n}
                </div>
                <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">
                  {t(step.title)}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {t(step.desc)}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-12 md:mt-16 text-xs italic text-[var(--muted-foreground)] max-w-2xl leading-relaxed border-l-2 border-[var(--border)] pl-4">
            {t("landing.pos_footnote")}
          </p>
        </div>
      </section>

      {/* Why Fungi Matter */}
      <section className="py-16 md:py-24 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] tracking-tight mb-6">
              {t("landing.mission_title")}
            </h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
              {t("landing.mission_p1")}
            </p>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              {t("landing.mission_p2")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {([
              { num: "landing.fact1_number" as TranslationKey, label: "landing.fact1_label" as TranslationKey, desc: "landing.fact1_desc" as TranslationKey, color: "text-spore" },
              { num: "landing.fact2_number" as TranslationKey, label: "landing.fact2_label" as TranslationKey, desc: "landing.fact2_desc" as TranslationKey, color: "text-moss" },
              { num: "landing.fact3_number" as TranslationKey, label: "landing.fact3_label" as TranslationKey, desc: "landing.fact3_desc" as TranslationKey, color: "text-mycelium" },
            ]).map((fact) => (
              <div key={fact.label}>
                <div className={`text-3xl md:text-4xl font-bold tracking-tight ${fact.color}`}>
                  {t(fact.num)}
                </div>
                <div className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mt-1 mb-2">
                  {t(fact.label)}
                </div>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {t(fact.desc)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] tracking-tight mb-10">
            {t("landing.faq_title")}
          </h2>
          <div>
            {([
              { q: "landing.faq1_q" as TranslationKey, a: "landing.faq1_a" as TranslationKey },
              { q: "landing.faq2_q" as TranslationKey, a: "landing.faq2_a" as TranslationKey },
              { q: "landing.faq3_q" as TranslationKey, a: "landing.faq3_a" as TranslationKey },
              { q: "landing.faq4_q" as TranslationKey, a: "landing.faq4_a" as TranslationKey },
              { q: "landing.faq5_q" as TranslationKey, a: "landing.faq5_a" as TranslationKey },
            ]).map((faq) => (
              <details key={faq.q} className="group border-b border-[var(--border)]">
                <summary className="py-5 cursor-pointer text-[var(--foreground)] font-medium text-base flex items-center justify-between gap-4">
                  <span>{t(faq.q)}</span>
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 group-open:rotate-180"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="pb-5 text-sm text-[var(--muted-foreground)] leading-relaxed pr-8">
                  {t(faq.a)}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] tracking-tight mb-4">
            {t("landing.founding_title")}
          </h2>
          <p className="text-[var(--muted-foreground)] mb-8 max-w-md mx-auto">
            {t("landing.founding_desc")}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/observe"
              className="px-6 py-3 bg-forest text-white rounded-xl text-sm font-semibold hover:bg-forest-light transition-colors"
            >
              {t("landing.founding_cta")}
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              {t("about.title")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
