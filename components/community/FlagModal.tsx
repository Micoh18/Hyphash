"use client";

import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { FLAG_REASONS } from "@/types";
import type { FlagReason } from "@/types";
import type { TranslationKey } from "@/lib/i18n/translations/en";

const FLAG_REASON_KEYS: Record<FlagReason, TranslationKey> = {
  inappropriate_content: "flag_reason.inappropriate_content",
  spam: "flag_reason.spam",
  wrong_content: "flag_reason.wrong_content",
  duplicate: "flag_reason.duplicate",
  misleading_id: "flag_reason.misleading_id",
  low_quality: "flag_reason.low_quality",
  other: "flag_reason.other",
};

export function FlagModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (reason: FlagReason, details?: string) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [reason, setReason] = useState<FlagReason | "">("");
  const [details, setDetails] = useState("");

  const handleSubmit = () => {
    if (!reason) return;
    onSubmit(reason, details.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-5 space-y-4 animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[var(--foreground)]">
            {t("flag.report_observation")}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            {t("flag.reason")}
          </label>
          {FLAG_REASONS.map((r) => (
            <label
              key={r}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                reason === r
                  ? "border-red-300 bg-red-50 dark:bg-red-950/20"
                  : "border-[var(--border)] hover:bg-[var(--muted)]"
              }`}
            >
              <input
                type="radio"
                name="flag-reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="accent-red-500"
              />
              <span className="text-sm text-[var(--foreground)]">
                {t(FLAG_REASON_KEYS[r])}
              </span>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            {reason === "other" ? t("flag.details_required") : t("flag.details")}
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)]"
          >
            {t("flag.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || (reason === "other" && !details.trim())}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {t("flag.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
