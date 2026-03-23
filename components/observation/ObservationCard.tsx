"use client";

import Link from "next/link";
import type { Observation } from "@/types";
import { STATUS_COLORS } from "@/types";
import { useI18n } from "@/hooks/useI18n";
import { FlagIndicator } from "@/components/community/FlagIndicator";

export function ObservationCard({ observation }: { observation: Observation }) {
  const { t } = useI18n();

  const species =
    observation.verified_species ??
    observation.proposed_species ??
    t("common.unknown_species");

  return (
    <Link
      href={`/observation/${observation.id}`}
      className="block bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-moss transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-[var(--foreground)] italic truncate">
            {species}
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {new Date(observation.observed_at).toLocaleDateString()} &middot;{" "}
            {observation.observer?.username ?? t("common.anonymous")}
          </p>
          {observation.notes && (
            <p className="text-xs text-[var(--muted-foreground)] mt-1.5 line-clamp-2">
              {observation.notes}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <FlagIndicator observationId={observation.id} />
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
            style={{ backgroundColor: STATUS_COLORS[observation.status] }}
          >
            {t(`status.${observation.status}`)}
          </span>
        </div>
      </div>
    </Link>
  );
}
