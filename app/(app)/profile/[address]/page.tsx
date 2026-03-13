"use client";

import { use } from "react";
import { MOCK_PROFILES } from "@/lib/mock-data";
import { useObservations } from "@/hooks/useObservations";
import { useI18n } from "@/hooks/useI18n";
import { ObservationCard } from "@/components/observation/ObservationCard";
import Link from "next/link";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const { observations } = useObservations();
  const { t } = useI18n();

  const profile = MOCK_PROFILES.find((p) => p.stellar_address === address);
  const userObs = observations.filter((o) => {
    if (profile) return o.observer_id === profile.id;
    return false;
  });

  const verifiedCount = userObs.filter(
    (o) => o.status === "community_id"
  ).length;
  const speciesSet = new Set(
    userObs
      .map((o) => o.verified_species ?? o.proposed_species)
      .filter(Boolean)
  );

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="text-4xl mb-4">🍄</div>
          <p className="text-[var(--foreground)] font-medium">
            {t("profile.not_found")}
          </p>
          <Link
            href="/map"
            className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 block"
          >
            {t("common.back_to_map")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 bg-[var(--card)]/90 backdrop-blur border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link
            href="/map"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {t("detail.map_back")}
          </Link>
          <h1 className="font-semibold text-[var(--foreground)]">{t("profile.title")}</h1>
          <div className="w-12" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-2xl mx-auto mb-3">
            {(profile.username ?? "?")[0].toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            {profile.username ?? t("profile.anonymous")}
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] font-mono mt-1">
            {profile.stellar_address.slice(0, 8)}...
            {profile.stellar_address.slice(-8)}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {t("profile.joined")} {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {userObs.length}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {t("common.observations")}
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <div className="text-2xl font-bold text-emerald-600">
              {verifiedCount}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {t("common.verified")}
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <div className="text-2xl font-bold text-violet-600">
              {speciesSet.size}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {t("common.species")}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            {t("common.observations")}
          </h3>
          {userObs.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
              {t("profile.no_observations")}
            </p>
          ) : (
            <div className="space-y-2">
              {userObs.map((obs) => (
                <ObservationCard key={obs.id} observation={obs} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
