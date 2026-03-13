"use client";

import { useCallback } from "react";
import type { PhotoType } from "@/types";
import { useI18n } from "@/hooks/useI18n";
import { useImageValidation } from "@/hooks/useImageValidation";
import type { TranslationKey } from "@/lib/i18n/translations/en";

export type ValidationStatus = "pending" | "validating" | "valid" | "invalid";

export interface LocalPhoto {
  file: File;
  preview: string;
  type: PhotoType;
  validationStatus: ValidationStatus;
  validationMessage?: string;
}

const PHOTO_TYPES: PhotoType[] = [
  "cap_top", "underside", "stem", "cross_section", "habitat", "other",
];

const PHOTO_TYPE_KEYS: Record<PhotoType, TranslationKey> = {
  cap_top: "photo_type.cap_top",
  underside: "photo_type.underside",
  stem: "photo_type.stem",
  cross_section: "photo_type.cross_section",
  habitat: "photo_type.habitat",
  other: "photo_type.other",
};

export function PhotoUpload({
  photos,
  setPhotos,
}: {
  photos: LocalPhoto[];
  setPhotos: (photos: LocalPhoto[] | ((prev: LocalPhoto[]) => LocalPhoto[])) => void;
}) {
  const { t } = useI18n();
  const { validate } = useImageValidation();

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const newPhotos: LocalPhoto[] = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        type: "other" as PhotoType,
        validationStatus: "validating" as ValidationStatus,
      }));

      const allPhotos = [...photos, ...newPhotos];
      setPhotos(allPhotos);

      // Validate each new photo
      for (let i = 0; i < newPhotos.length; i++) {
        const photo = newPhotos[i];
        const result = await validate(photo.file);
        const globalIndex = photos.length + i;

        setPhotos((prev: LocalPhoto[]) =>
          prev.map((p, idx) =>
            idx === globalIndex
              ? {
                  ...p,
                  validationStatus: (result.valid ? "valid" : "invalid") as ValidationStatus,
                  validationMessage: result.valid ? undefined : result.topLabel,
                }
              : p
          )
        );
      }
    },
    [photos, setPhotos, validate]
  );

  const removePhoto = (index: number) => {
    const updated = [...photos];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setPhotos(updated);
  };

  const updateType = (index: number, type: PhotoType) => {
    const updated = [...photos];
    updated[index] = { ...updated[index], type };
    setPhotos(updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">
          {t("photos.title")}
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] mb-3">
          {t("photos.description")}
        </p>
      </div>

      <label className="block border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-3xl mb-2">📷</div>
        <p className="text-sm font-medium text-[var(--foreground)]">
          {t("photos.tap_to_add")}
        </p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {t("photos.size_hint")}
        </p>
      </label>

      {photos.length > 0 && (
        <div className="space-y-3">
          {photos.map((photo, i) => (
            <div
              key={i}
              className={`flex gap-3 p-3 rounded-xl bg-[var(--card)] border transition-colors ${
                photo.validationStatus === "invalid"
                  ? "border-red-300 bg-red-50/50"
                  : photo.validationStatus === "validating"
                  ? "border-amber-300"
                  : "border-[var(--border)]"
              }`}
            >
              <div className="relative flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview}
                  alt={`Photo ${i + 1}`}
                  className={`w-20 h-20 object-cover rounded-lg ${
                    photo.validationStatus === "invalid" ? "opacity-50" : ""
                  }`}
                />
                {photo.validationStatus === "validating" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {photo.validationStatus === "valid" && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    ✓
                  </div>
                )}
                {photo.validationStatus === "invalid" && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    !
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {photo.validationStatus === "invalid" ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-red-600">
                      {t("validation.invalid")}
                    </p>
                    <button
                      onClick={() => removePhoto(i)}
                      className="px-3 py-1 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      {t("validation.remove")}
                    </button>
                  </div>
                ) : (
                  <>
                    <select
                      value={photo.type}
                      onChange={(e) => updateType(i, e.target.value as PhotoType)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] mb-1"
                    >
                      {PHOTO_TYPES.map((pt) => (
                        <option key={pt} value={pt}>
                          {t(PHOTO_TYPE_KEYS[pt])}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-[var(--muted-foreground)] truncate">
                      {photo.validationStatus === "validating"
                        ? t("validation.checking")
                        : photo.file.name}
                    </p>
                  </>
                )}
              </div>
              {photo.validationStatus !== "invalid" && (
                <button
                  onClick={() => removePhoto(i)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
