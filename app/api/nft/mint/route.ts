import { NextResponse } from "next/server";
import { mintNFT, isConfigured } from "@/lib/stellar/nft";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiGuard, userRateLimit } from "@/lib/api-guard";
import { decryptSecret } from "@/lib/stellar/wallet-crypto";

// 5 mints per hour per IP
const GUARD_CONFIG = { limit: 5, windowSeconds: 3600, route: "nft-mint" };

/**
 * POST /api/nft/mint
 *
 * Fully server-side NFT minting. No client signing needed.
 * The server decrypts the observer's custodial key, signs both sides,
 * submits the transaction, and records the result.
 */
export async function POST(request: Request) {
  const guard = apiGuard(request, GUARD_CONFIG);
  if (guard.blocked) return guard.response;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const userLimit = userRateLimit(user.id, "nft-mint", 5, 3600);
  if (userLimit.blocked) return userLimit.response;

  if (!isConfigured()) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  try {
    const { observationId } = await request.json();

    if (!observationId) {
      return NextResponse.json({ error: "observationId is required" }, { status: 400 });
    }

    // Verify ownership + consensus + not already minted
    const { data: obs } = await supabase
      .from("observations")
      .select("observer_id, status, nft_tx_hash, ipfs_metadata_cid")
      .eq("id", observationId)
      .single();

    if (!obs) {
      return NextResponse.json({ error: "Observation not found" }, { status: 404 });
    }
    if (obs.observer_id !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    if (obs.status !== "community_id") {
      return NextResponse.json({ error: "Observation has not reached community consensus" }, { status: 400 });
    }
    if (obs.nft_tx_hash) {
      return NextResponse.json({ error: "NFT already minted" }, { status: 409 });
    }

    // Get observer's custodial wallet
    const admin = createAdminClient();
    const { data: wallet } = await admin
      .from("stellar_wallets")
      .select("public_key, encrypted_secret, funded")
      .eq("user_id", user.id)
      .single();

    if (!wallet) {
      return NextResponse.json({ error: "No Stellar wallet found" }, { status: 400 });
    }
    if (!wallet.funded) {
      return NextResponse.json({ error: "Wallet not yet funded" }, { status: 400 });
    }

    // Decrypt observer secret
    const observerSecret = decryptSecret(wallet.encrypted_secret);

    // Use IPFS CID from the observation if available, otherwise use a placeholder
    const metadataCid = obs.ipfs_metadata_cid ?? `pending-${observationId}`;

    // Mint: build, sign both sides, submit
    const result = await mintNFT({
      observerAddress: wallet.public_key,
      observerSecret,
      observationId,
      metadataCid,
    });

    // Record NFT data via admin client
    await admin
      .from("observations")
      .update({
        nft_tx_hash: result.txHash,
        nft_asset_code: result.assetCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", observationId);

    return NextResponse.json({
      txHash: result.txHash,
      assetCode: result.assetCode,
      issuerAddress: result.issuerAddress,
    });
  } catch (error) {
    console.error("NFT mint error:", error);
    return NextResponse.json({ error: "NFT minting failed" }, { status: 500 });
  }
}
