"use client";

import { use, useEffect, useMemo } from "react";
import { useObservations } from "@/hooks/useObservations";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { PhotoGallery } from "@/components/observation/PhotoGallery";
import { CommentThread } from "@/components/community/CommentThread";
import { CommentInput } from "@/components/community/CommentInput";
import { VerificationBadge } from "@/components/community/VerificationBadge";
import { FlagButton } from "@/components/community/FlagButton";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";
import type { Comment, CommentType, Profile } from "@/types";

export default function ObservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const supabase = useMemo(() => createClient(), []);
  const { getById, refresh } = useObservations();
  const { profile } = useAuth();
  const { t } = useI18n();
  const observation = getById(id);

  const [comments, setComments] = useState<Comment[]>([]);
  const [consensusStatus, setConsensusStatus] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);

  const isObserver = profile?.id === observation?.observer_id;

  const handleMint = async () => {
    if (!observation) return;
    setMinting(true);
    setMintError(null);
    try {
      const res = await fetch("/api/nft/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observationId: observation.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMintError(data.error ?? "Minting failed");
      } else {
        refresh();
      }
    } catch {
      setMintError("Network error");
    } finally {
      setMinting(false);
    }
  };

  // Fetch comments from Supabase
  useEffect(() => {
    async function fetchComments() {
      const { data } = await supabase
        .from("comments")
        .select("*, author:profiles!author_id(*)")
        .eq("observation_id", id)
        .order("created_at", { ascending: true });
      if (data) {
        setComments(
          data.map((c) => ({
            ...c,
            author: c.author as Profile | undefined,
          })) as Comment[]
        );
      }
    }
    fetchComments();
  }, [id]);

  if (!observation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-[var(--muted-foreground)] opacity-40">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <path d="M8 11h6" />
          </svg>
          <p className="text-[var(--foreground)] font-medium">
            {t("detail.not_found")}
          </p>
          <Link
            href="/map"
            className="text-sm text-forest hover:text-forest-light mt-2 block"
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

  const handleAddComment = async (
    body: string,
    type: CommentType,
    suggestedSpecies?: string
  ) => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      observation_id: id,
      author_id: profile?.id ?? "anonymous",
      body,
      comment_type: type,
      suggested_species: suggestedSpecies ?? null,
      created_at: new Date().toISOString(),
      author: profile ?? undefined,
    };
    // Optimistic update
    setComments((prev) => [...prev, newComment]);

    // Persist to Supabase
    await supabase.from("comments").insert({
      observation_id: id,
      author_id: profile?.id,
      body,
      comment_type: type,
      suggested_species: suggestedSpecies || null,
    });

    // Server handles all status transitions (unverified→discussing, discussing→community_id)
    try {
      const res = await fetch("/api/consensus/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observationId: id }),
      });
      const data = await res.json();

      if (data.consensus && !data.alreadyMinted) {
        setConsensusStatus("verified");
      }
      refresh();
    } catch (err) {
      console.error("Consensus check failed:", err);
    }
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
            className="font-medium text-[var(--foreground)] hover:text-forest"
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

        {/* Mint banner: observer can claim their NFT */}
        {observation.status === "community_id" && !observation.nft_tx_hash && (
          <div className="p-4 rounded-xl bg-spore/10 border border-spore/20">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-spore" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-spore">Community verified</span>
            </div>

            {isObserver ? (
              <div>
                <button
                  onClick={handleMint}
                  disabled={minting}
                  className="w-full py-2.5 bg-spore text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {minting ? "Minting..." : "Claim your NFT on Stellar"}
                </button>
                {mintError && (
                  <p className="text-xs text-red-500 mt-1">{mintError}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)]">
                The observer can claim their NFT for this verified observation.
              </p>
            )}
          </div>
        )}

        {/* Consensus just reached notification */}
        {consensusStatus === "verified" && observation.status !== "community_id" && (
          <div className="p-3 rounded-xl bg-forest/10 border border-forest/20 text-sm font-medium flex items-center gap-2 text-forest">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Community consensus reached!
          </div>
        )}

        {/* Already minted badge */}
        {observation.nft_tx_hash && (
          <div className="p-3 rounded-xl bg-forest/10 border border-forest/20 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-forest font-medium">On-chain</span>
            {observation.nft_asset_code && (
              <span className="text-xs text-forest/60 font-mono">{observation.nft_asset_code}</span>
            )}
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${observation.nft_tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest/70 hover:text-forest underline ml-auto text-xs"
            >
              View on Stellar
            </a>
          </div>
        )}

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pl-3 border-l-2 border-violet-200">
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
