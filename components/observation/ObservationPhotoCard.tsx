"use client";

import Link from "next/link";
import type { Observation } from "@/types";
import { STATUS_COLORS } from "@/types";
import { useI18n } from "@/hooks/useI18n";

export function ObservationPhotoCard({ observation }: { observation: Observation }) {
  const { t } = useI18n();

  const species =
    observation.verified_species ??
    observation.proposed_species ??
    t("common.unknown_species");

  const photo = observation.photos?.[0];

  return (
    <Link
      href={`/observation/${observation.id}`}
      className="group block rounded-2xl overflow-hidden bg-[var(--card)] border border-[var(--border)] hover:border-emerald-300 transition-all duration-200 hover:shadow-lg"
    >
      {/* Photo area */}
      <div className="aspect-square bg-[var(--muted)] relative overflow-hidden">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.storage_path}
            alt={species}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[var(--muted-foreground)] opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
              />
            </svg>
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-2 right-2">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-sm"
            style={{ backgroundColor: STATUS_COLORS[observation.status] }}
          >
            {t(`status.${observation.status}`)}
          </span>
        </div>

        {/* Photo count */}
        {observation.photos && observation.photos.length > 1 && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6.75v11.5A2.25 2.25 0 003.75 21z" />
            </svg>
            {observation.photos.length}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-[var(--foreground)] italic truncate">
          {species}
        </h3>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 flex items-center gap-1">
          <span>{new Date(observation.observed_at).toLocaleDateString()}</span>
          <span>&middot;</span>
          <span className="truncate">{observation.observer?.username ?? t("common.anonymous")}</span>
        </p>
      </div>
    </Link>
  );
}
