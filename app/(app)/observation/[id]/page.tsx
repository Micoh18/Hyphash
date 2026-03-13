"use client";

import { use } from "react";
import { useObservations } from "@/hooks/useObservations";
import { useWallet } from "@/hooks/useWallet";
import { useI18n } from "@/hooks/useI18n";
import { PhotoGallery } from "@/components/observation/PhotoGallery";
import { CommentThread } from "@/components/community/CommentThread";
import { CommentInput } from "@/components/community/CommentInput";
import { VerificationBadge } from "@/components/community/VerificationBadge";
import { FlagButton } from "@/components/community/FlagButton";
import { MOCK_COMMENTS } from "@/lib/mock-data";
import Link from "next/link";
import { useState } from "react";
import type { Comment, CommentType } from "@/types";

export default function ObservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getById } = useObservations();
  const { profile } = useWallet();
  const { t } = useI18n();
  const observation = getById(id);

  const [comments, setComments] = useState<Comment[]>(
    MOCK_COMMENTS.filter((c) => c.observation_id === id)
  );

  if (!observation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="text-4xl mb-4">🍄</div>
          <p className="text-[var(--foreground)] font-medium">
            {t("detail.not_found")}
          </p>
          <Link
            href="/map"
            className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 block"
          >
            {t("common.back_to_map")}
          </Link>
        </div>
      </div>
    );
  }

  const species =
    observation.verified_species ??
    observation.proposed_species ??
    t("common.unknown_species");

  const handleAddComment = (
    body: string,
    type: CommentType,
    suggestedSpecies?: string
  ) => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      observation_id: id,
      author_id: profile?.id ?? "anonymous",
      body,
      comment_type: type,
      suggested_species: suggestedSpecies ?? null,
      created_at: new Date().toISOString(),
      author: profile ?? undefined,
    };
    setComments((prev) => [...prev, newComment]);
  };

  const detailRows: Array<{ label: string; value: string | null | undefined }> =
    [
      { label: t("detail.cap_shape"), value: observation.cap_shape },
      { label: t("detail.cap_color"), value: observation.cap_color },
      {
        label: t("detail.cap_size"),
        value: observation.cap_size_cm
          ? `${observation.cap_size_cm} ${t("common.cm")}`
          : null,
      },
      { label: t("detail.cap_surface"), value: observation.cap_surface },
      { label: t("detail.underside"), value: observation.underside_type },
      { label: t("detail.underside_color"), value: observation.underside_color },
      { label: t("detail.stem_color"), value: observation.stem_color },
      {
        label: t("detail.stem_height"),
        value: observation.stem_height_cm
          ? `${observation.stem_height_cm} ${t("common.cm")}`
          : null,
      },
      {
        label: t("detail.stem_hollow"),
        value:
          observation.stem_hollow === null
            ? null
            : observation.stem_hollow
            ? t("common.yes")
            : t("common.no"),
      },
      {
        label: t("detail.ring"),
        value:
          observation.stem_ring === null
            ? null
            : observation.stem_ring
            ? t("common.yes")
            : t("common.no"),
      },
      { label: t("detail.flesh_color"), value: observation.flesh_color },
      { label: t("detail.bruise_color"), value: observation.bruise_color },
      { label: t("detail.smell"), value: observation.smell },
      { label: t("detail.substrate"), value: observation.substrate },
      { label: t("detail.habitat"), value: observation.habitat },
      { label: t("detail.growth"), value: observation.growth_pattern },
      { label: t("detail.spore_print"), value: observation.spore_print_color },
    ];

  const advancedRows: Array<{ label: string; value: string | null | undefined }> =
    [
      { label: t("detail.cap_margin"), value: observation.cap_margin },
      { label: t("detail.gill_attachment"), value: observation.gill_attachment },
      { label: t("detail.gill_spacing"), value: observation.underside_spacing },
      { label: t("detail.stem_shape"), value: observation.stem_shape },
      { label: t("detail.stem_surface"), value: observation.stem_surface },
      { label: t("detail.stem_base"), value: observation.stem_base },
      {
        label: t("detail.volva"),
        value:
          observation.has_volva === null
            ? null
            : observation.has_volva
            ? t("common.yes")
            : t("common.no"),
      },
      { label: t("detail.flesh_consistency"), value: observation.flesh_consistency },
      { label: t("detail.color_change"), value: observation.color_change },
      {
        label: t("detail.latex"),
        value:
          observation.has_latex === null
            ? null
            : observation.has_latex
            ? t("common.yes")
            : t("common.no"),
      },
      { label: t("detail.latex_color"), value: observation.latex_color },
      { label: t("detail.taste"), value: observation.taste },
      { label: t("detail.ecological_role"), value: observation.ecological_role },
      { label: t("detail.associated_trees"), value: observation.associated_trees },
      { label: t("detail.season"), value: observation.season },
    ];

  const filledDetails = detailRows.filter((d) => d.value);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 bg-[var(--card)]/90 backdrop-blur border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link
            href="/map"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {t("detail.map_back")}
          </Link>
          <h1 className="font-semibold text-[var(--foreground)] truncate mx-4 italic">
            {species}
          </h1>
          <div className="w-12" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <PhotoGallery photos={observation.photos ?? []} />

        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[var(--foreground)] italic flex-1">
              {species}
            </h2>
            <VerificationBadge status={observation.status} />
            <FlagButton observationId={observation.id} observerId={observation.observer_id} />
          </div>
          {observation.verified_species &&
            observation.proposed_species &&
            observation.verified_species !== observation.proposed_species && (
              <p className="text-xs text-[var(--muted-foreground)]">
                {t("detail.originally_proposed")} {observation.proposed_species}
              </p>
            )}
          {observation.confidence && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              {t("detail.confidence")}{" "}
              {t(`confidence.${observation.confidence}`)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
          <Link
            href={`/profile/${observation.observer?.stellar_address ?? ""}`}
            className="font-medium text-[var(--foreground)] hover:text-emerald-600"
          >
            {observation.observer?.username ?? t("common.anonymous")}
          </Link>
          <span>&middot;</span>
          <span>{new Date(observation.observed_at).toLocaleDateString()}</span>
          <span>&middot;</span>
          <span>
            {observation.latitude.toFixed(4)}, {observation.longitude.toFixed(4)}
          </span>
        </div>

        {observation.notes && (
          <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <p className="text-sm text-[var(--foreground)] leading-relaxed">
              {observation.notes}
            </p>
          </div>
        )}

        {filledDetails.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">
              {t("detail.description")}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {filledDetails.map((d) => (
                <div key={d.label} className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">{d.label}</span>
                  <span className="text-[var(--foreground)] font-medium text-right">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {advancedRows.filter((d) => d.value).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-violet-700 mb-2">
              {t("detail.advanced_description")}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pl-3 border-l-2 border-violet-200">
              {advancedRows.filter((d) => d.value).map((d) => (
                <div key={d.label} className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">{d.label}</span>
                  <span className="text-[var(--foreground)] font-medium text-right">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            {t("detail.discussion")} ({comments.length})
          </h3>
          <CommentThread comments={comments} />
          <div className="mt-3">
            <CommentInput onSubmit={handleAddComment} />
          </div>
        </div>
      </div>
    </div>
  );
}
