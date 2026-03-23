"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useObservations } from "@/hooks/useObservations";
import { useI18n } from "@/hooks/useI18n";
import { FlagModal } from "./FlagModal";
import type { FlagReason } from "@/types";

export function FlagButton({ observationId, observerId }: { observationId: string; observerId: string }) {
  const { profile } = useAuth();
  const { flagObservation, hasUserFlagged } = useObservations();
  const { t } = useI18n();
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isOwnObservation = profile?.id === observerId;
  const alreadyFlagged = profile ? hasUserFlagged(observationId, profile.id) : false;

  const handleSubmit = (reason: FlagReason, details?: string) => {
    if (!profile) return;
    flagObservation(observationId, profile.id, reason, details);
    setShowModal(false);
    setSubmitted(true);
  };

  if (!profile) {
    return (
      <button
        disabled
        className="text-xs text-[var(--muted-foreground)] opacity-50 cursor-not-allowed"
        title={t("flag.connect_to_flag")}
      >
        {t("flag.report")}
      </button>
    );
  }

  if (isOwnObservation) return null;

  if (alreadyFlagged || submitted) {
    return (
      <span className="text-xs text-amber-600 font-medium">
        {t("flag.already_flagged")}
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-xs text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
      >
        {t("flag.report")}
      </button>
      {showModal && (
        <FlagModal
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
