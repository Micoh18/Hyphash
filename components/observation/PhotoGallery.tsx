"use client";

import { useState } from "react";
import type { ObservationPhoto } from "@/types";
import { useI18n } from "@/hooks/useI18n";
import type { TranslationKey } from "@/lib/i18n/translations/en";

const PHOTO_TYPE_KEYS: Record<string, TranslationKey> = {
  cap_top: "photo_type.cap_top",
  underside: "photo_type.underside",
  stem: "photo_type.stem",
  cross_section: "photo_type.cross_section",
  habitat: "photo_type.habitat",
  other: "photo_type.other",
};

export function PhotoGallery({ photos }: { photos: ObservationPhoto[] }) {
  const [selected, setSelected] = useState(0);
  const { t } = useI18n();

  if (photos.length === 0) {
    return (
      <div className="w-full aspect-video bg-[var(--muted)] rounded-xl flex items-center justify-center">
        <div className="text-center text-[var(--muted-foreground)]">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-sm">{t("photos.no_photos")}</p>
        </div>
      </div>
    );
  }

  const typeKey = PHOTO_TYPE_KEYS[photos[selected].photo_type] ?? "photo_type.other";

  return (
    <div className="space-y-2">
      <div className="w-full aspect-video bg-[var(--muted)] rounded-xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[selected].storage_path}
          alt={t(typeKey)}
          className="w-full h-full object-cover"
        />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setSelected(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === selected
                  ? "border-emerald-500"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.storage_path}
                alt={t(PHOTO_TYPE_KEYS[photo.photo_type] ?? "photo_type.other")}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-[var(--muted-foreground)] text-center">
        {t(typeKey)}
      </p>
    </div>
  );
}
