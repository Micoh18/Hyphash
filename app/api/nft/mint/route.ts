import { NextResponse } from "next/server";
import { buildMintTransaction, isConfigured } from "@/lib/stellar/nft";

/**
 * POST /api/nft/mint
 *
 * Accepts JSON body:
 * - observerAddress: string — Stellar address of the observer
 * - observationId: string — unique observation ID
 * - metadataCid: string — IPFS CID of the observation metadata
 *
 * Returns { xdr: string, assetCode: string, issuerAddress: string }
 * The XDR is partially signed (issuer). Observer must co-sign via Freighter.
 */
export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Stellar NFT minting not configured. Set STELLAR_ISSUER_SECRET and NEXT_PUBLIC_STELLAR_NETWORK." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { observerAddress, observationId, metadataCid } = body;

    if (!observerAddress || !observationId || !metadataCid) {
      return NextResponse.json(
        { error: "observerAddress, observationId, and metadataCid are required" },
        { status: 400 }
      );
    }

    const result = await buildMintTransaction({
      observerAddress,
      observationId,
      metadataCid,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("NFT mint error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "NFT minting failed" },
      { status: 500 }
    );
  }
}
