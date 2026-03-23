import type { SupabaseClient } from "@supabase/supabase-js";

const CONSENSUS_THRESHOLD = 3;

interface ConsensusResult {
  reached: boolean;
  species: string | null;
  agreeCount: number;
}

/**
 * Check if an observation has reached community consensus.
 * Consensus = 3+ unique users posted "agree" comments.
 * If "suggest" comments exist, the most-agreed species wins.
 */
export async function checkConsensus(
  supabase: SupabaseClient,
  observationId: string
): Promise<ConsensusResult> {
  const { data: comments } = await supabase
    .from("comments")
    .select("author_id, comment_type, suggested_species")
    .eq("observation_id", observationId);

  if (!comments) return { reached: false, species: null, agreeCount: 0 };

  const agreeAuthors = new Set(
    comments
      .filter((c) => c.comment_type === "agree")
      .map((c) => c.author_id)
  );

  const suggestions = comments
    .filter((c) => c.comment_type === "suggest" && c.suggested_species)
    .map((c) => c.suggested_species as string);

  let topSpecies: string | null = null;
  if (suggestions.length > 0) {
    const counts: Record<string, number> = {};
    for (const s of suggestions) {
      counts[s] = (counts[s] ?? 0) + 1;
    }
    topSpecies = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  return {
    reached: agreeAuthors.size >= CONSENSUS_THRESHOLD,
    species: topSpecies,
    agreeCount: agreeAuthors.size,
  };
}

/**
 * Update observation status to community_id and set verified species.
 */
export async function markAsVerified(
  supabase: SupabaseClient,
  observationId: string,
  verifiedSpecies: string | null
): Promise<string | null> {
  let species = verifiedSpecies;
  if (!species) {
    const { data: obs } = await supabase
      .from("observations")
      .select("proposed_species")
      .eq("id", observationId)
      .single();
    species = obs?.proposed_species ?? null;
  }

  await supabase
    .from("observations")
    .update({
      status: "community_id",
      verified_species: species,
      updated_at: new Date().toISOString(),
    })
    .eq("id", observationId);

  return species;
}
