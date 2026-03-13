import type { ObservationStatus } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";

export function VerificationBadge({ status }: { status: ObservationStatus }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: STATUS_COLORS[status] }}
    >
      {status === "community_id" && "✓ "}
      {STATUS_LABELS[status]}
    </span>
  );
}
