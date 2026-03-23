import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiGuard, userRateLimit } from "@/lib/api-guard";

// 5 confirms per hour per IP
const GUARD_CONFIG = { limit: 5, windowSeconds: 3600, route: "nft-confirm" };

/**
 * POST /api/nft/confirm
 *
 * Called after the observer signs and submits the NFT transaction.
 * Records the tx hash and asset code back to the observation.
 * Uses admin client to bypass the NFT field protection trigger.
 */
export async function POST(request: Request) {
  const guard = apiGuard(request, GUARD_CONFIG);
  if (guard.blocked) return guard.response;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const userLimit = userRateLimit(user.id, "nft-confirm", 5, 3600);
  if (userLimit.blocked) return userLimit.response;

  try {
    const { observationId, nftTxHash, nftAssetCode, ipfsMetadataCid } = await request.json();

    if (!observationId || !nftTxHash) {
      return NextResponse.json({ error: "observationId and nftTxHash required" }, { status: 400 });
    }

    // Verify ownership
    const { data: obs } = await supabase
      .from("observations")
      .select("observer_id, status, nft_tx_hash")
      .eq("id", observationId)
      .single();

    if (!obs) {
      return NextResponse.json({ error: "Observation not found" }, { status: 404 });
    }

    if (obs.observer_id !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (obs.nft_tx_hash) {
      return NextResponse.json({ error: "NFT already recorded" }, { status: 409 });
    }

    // Write via admin client (bypasses NFT field protection trigger)
    const admin = createAdminClient();
    await admin
      .from("observations")
      .update({
        nft_tx_hash: String(nftTxHash).slice(0, 128),
        nft_asset_code: nftAssetCode ? String(nftAssetCode).slice(0, 12) : null,
        ipfs_metadata_cid: ipfsMetadataCid ? String(ipfsMetadataCid).slice(0, 128) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", observationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("NFT confirm error:", error);
    return NextResponse.json({ error: "Failed to record NFT data" }, { status: 500 });
  }
}
