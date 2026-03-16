"use client";

import type { ObservationStatus } from "@/types";
import { STATUS_COLORS } from "@/types";
import { useI18n } from "@/hooks/useI18n";

export function VerificationBadge({ status }: { status: ObservationStatus }) {
  const { t } = useI18n();
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: STATUS_COLORS[status] }}
    >
      {status === "community_id" && "✓ "}
      {t(`status.${status}`)}
    </span>
  );
}
