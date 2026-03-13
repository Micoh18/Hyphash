"use client";

import { useObservations } from "@/hooks/useObservations";

export function FlagIndicator({ observationId }: { observationId: string }) {
  const { getFlagsForObservation } = useObservations();
  const flags = getFlagsForObservation(observationId);
  const pendingCount = flags.filter((f) => f.status === "pending").length;

  if (pendingCount === 0) return null;

  return (
    <span
      className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-red-700 bg-red-100"
      title={`${pendingCount} pending flag${pendingCount > 1 ? "s" : ""}`}
    >
      {pendingCount}
    </span>
  );
}
