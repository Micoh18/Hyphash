"use client";

import { useState } from "react";
import { useObservations } from "@/hooks/useObservations";
import { useI18n } from "@/hooks/useI18n";
import { ObservationPhotoCard } from "@/components/observation/ObservationPhotoCard";
import type { ObservationStatus } from "@/types";

type SortOption = "newest" | "oldest";

export default function FeedPage() {
  const { observations } = useObservations();
  const { t } = useI18n();
  const [statusFilter, setStatusFilter] = useState<ObservationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const filtered = observations
    .filter((obs) => {
      if (statusFilter !== "all" && obs.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const species = (obs.verified_species ?? obs.proposed_species ?? "").toLowerCase();
        const notes = (obs.notes ?? "").toLowerCase();
        const observer = (obs.observer?.username ?? "").toLowerCase();
        if (!species.includes(q) && !notes.includes(q) && !observer.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.observed_at).getTime();
      const dateB = new Date(b.observed_at).getTime();
      return sort === "newest" ? dateB - dateA : dateA - dateB;
    });

  // Urgency sections: split by what needs attention
  const needsId = filtered.filter((o) => o.status === "unverified");
  const inDiscussion = filtered.filter((o) => o.status === "discussing");
  const rest = filtered.filter((o) => o.status !== "unverified" && o.status !== "discussing");

  const statusOptions: (ObservationStatus | "all")[] = [
    "all", "unverified", "discussing", "community_id", "unknown",
  ];

  // Show urgency sections only in default view (no filter/search active)
  const showUrgencySections = statusFilter === "all" && !search && sort === "newest";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {t("feed.title")}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {filtered.length !== 1
              ? t("feed.observations_count", { count: filtered.length })
              : t("feed.observation_count", { count: filtered.length })}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder={t("feed.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-moss/30"
          >
            <option value="newest">{t("feed.newest_first")}</option>
            <option value="oldest">{t("feed.oldest_first")}</option>
          </select>
        </div>

        {/* Status pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1" role="group" aria-label="Filter by status">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? "bg-forest text-white"
                  : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {status === "all" ? t("feed.all") : t(`status.${status}`)}
            </button>
          ))}
        </div>

        {/* Content */}
        {filtered.length > 0 ? (
          showUrgencySections ? (
            <div className="space-y-10">
              {/* Needs identification */}
              {needsId.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <h2 className="text-sm font-semibold text-[var(--foreground)]">
                      {t("feed.needs_id") || "Needs identification"}
                    </h2>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      ({needsId.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {needsId.map((obs) => (
                      <ObservationPhotoCard key={obs.id} observation={obs} />
                    ))}
                  </div>
                </div>
              )}

              {/* Active discussions */}
              {inDiscussion.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <h2 className="text-sm font-semibold text-[var(--foreground)]">
                      {t("feed.active_discussions") || "Active discussions"}
                    </h2>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      ({inDiscussion.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {inDiscussion.map((obs) => (
                      <ObservationPhotoCard key={obs.id} observation={obs} />
                    ))}
                  </div>
                </div>
              )}

              {/* Identified / other */}
              {rest.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-moss" />
                    <h2 className="text-sm font-semibold text-[var(--foreground)]">
                      {t("feed.identified") || "Identified"}
                    </h2>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      ({rest.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {rest.map((obs) => (
                      <ObservationPhotoCard key={obs.id} observation={obs} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Flat grid when filtering/searching */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {filtered.map((obs) => (
                <ObservationPhotoCard key={obs.id} observation={obs} />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-24">
            <svg
              className="w-16 h-16 mx-auto text-[var(--muted-foreground)] opacity-40 mb-4"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            <p className="text-[var(--muted-foreground)] text-sm">
              {t("feed.no_results")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
