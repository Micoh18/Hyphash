"use client";

import { useState } from "react";
import { useObservations } from "@/hooks/useObservations";
import { useI18n } from "@/hooks/useI18n";
import type { ObservationStatus } from "@/types";
import { STATUS_COLORS } from "@/types";

const STATUSES: Array<ObservationStatus | "all"> = [
  "all", "unverified", "discussing", "community_id", "unknown",
];

export function MapFilters() {
  const { filters, setFilters } = useObservations();
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  return (
    <div aria-label="Map filters" className="ml-14 md:ml-0 bg-[var(--card)]/90 backdrop-blur rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--foreground)] w-full"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {t("map.filters")}
        {filters.status !== "all" && (
          <span className="ml-1 w-2 h-2 rounded-full bg-moss" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilters({ ...filters, status: s })}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  filters.status === s
                    ? "bg-forest text-white"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
                }`}
              >
                {s === "all" ? (
                  t("feed.all")
                ) : (
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[s] }}
                    />
                    {t(`status.${s}`)}
                  </span>
                )}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder={t("map.search_species")}
            value={filters.species}
            onChange={(e) => setFilters({ ...filters, species: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-moss"
          />
        </div>
      )}
    </div>
  );
}
