"use client";

import { useState, useCallback } from "react";

export type PublishStep = "idle" | "uploading_ipfs" | "minting_nft" | "signing" | "done" | "error";

interface PublishState {
  step: PublishStep;
  error: string | null;
  ipfsMetadataCid: string | null;
  ipfsPhotoCids: string[];
  nftAssetCode: string | null;
  nftTxHash: string | null;
}

interface PublishParams {
  observationId: string;
  observerAddress: string;
  species: string | null;
  location: { lat: number; lng: number };
  observedAt: string;
  notes: string | null;
  photos: File[];
}

export function usePublishObservation() {
  const [state, setState] = useState<PublishState>({
    step: "idle",
    error: null,
    ipfsMetadataCid: null,
    ipfsPhotoCids: [],
    nftAssetCode: null,
    nftTxHash: null,
  });

  const publish = useCallback(async (params: PublishParams) => {
    setState((s) => ({ ...s, step: "uploading_ipfs", error: null }));

    try {
      // Step 1: Upload photos + metadata to IPFS
      const formData = new FormData();
      for (const photo of params.photos) {
        formData.append("images", photo);
      }
      formData.append(
        "metadata",
        JSON.stringify({
          id: params.observationId,
          species: params.species,
          location: params.location,
          observed_at: params.observedAt,
          observer_address: params.observerAddress,
          notes: params.notes,
        })
      );

      const ipfsRes = await fetch("/api/ipfs/upload", {
        method: "POST",
        body: formData,
      });

      if (!ipfsRes.ok) {
        const data = await ipfsRes.json();
        // 503 = not configured, skip IPFS silently
        if (ipfsRes.status === 503) {
          setState((s) => ({ ...s, step: "done", error: null }));
          return { ipfsMetadataCid: null, nftTxHash: null };
        }
        throw new Error(data.error ?? "IPFS upload failed");
      }

      const ipfsData = await ipfsRes.json();
      setState((s) => ({
        ...s,
        ipfsMetadataCid: ipfsData.metadataCid,
        ipfsPhotoCids: ipfsData.photoCids,
        step: "minting_nft",
      }));

      // Step 2: Build NFT mint transaction (server-side)
      const mintRes = await fetch("/api/nft/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observerAddress: params.observerAddress,
          observationId: params.observationId,
          metadataCid: ipfsData.metadataCid,
        }),
      });

      if (!mintRes.ok) {
        const data = await mintRes.json();
        if (mintRes.status === 503) {
          // NFT not configured, observation still saved with IPFS data
          setState((s) => ({ ...s, step: "done" }));
          return { ipfsMetadataCid: ipfsData.metadataCid, nftTxHash: null };
        }
        throw new Error(data.error ?? "NFT minting failed");
      }

      const mintData = await mintRes.json();
      setState((s) => ({
        ...s,
        nftAssetCode: mintData.assetCode,
        step: "signing",
      }));

      // Step 3: Sign with Freighter (browser-side)
      const freighterApi = await import("@stellar/freighter-api");
      const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";

      let signedXdr: string;
      try {
        signedXdr = await freighterApi.signTransaction(mintData.xdr, {
          networkPassphrase:
            network === "public"
              ? "Public Global Stellar Network ; September 2015"
              : "Test SDF Network ; September 2015",
        });
      } catch {
        // User rejected the signature — IPFS is done, NFT skipped
        setState((s) => ({ ...s, step: "done" }));
        return { ipfsMetadataCid: ipfsData.metadataCid, nftTxHash: null };
      }

      // Step 4: Submit signed transaction to Horizon
      const horizonUrl =
        network === "public"
          ? "https://horizon.stellar.org"
          : "https://horizon-testnet.stellar.org";

      const submitRes = await fetch(`${horizonUrl}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `tx=${encodeURIComponent(signedXdr)}`,
      });

      const submitData = await submitRes.json();

      if (!submitRes.ok) {
        throw new Error(submitData.extras?.result_codes?.operations?.join(", ") ?? "Transaction failed");
      }

      setState((s) => ({
        ...s,
        nftTxHash: submitData.hash,
        step: "done",
      }));

      return {
        ipfsMetadataCid: ipfsData.metadataCid,
        nftTxHash: submitData.hash as string,
        nftAssetCode: mintData.assetCode as string,
        ipfsPhotoCids: ipfsData.photoCids as string[],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Publishing failed";
      setState((s) => ({ ...s, step: "error", error: message }));
      return { ipfsMetadataCid: null, nftTxHash: null };
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      step: "idle",
      error: null,
      ipfsMetadataCid: null,
      ipfsPhotoCids: [],
      nftAssetCode: null,
      nftTxHash: null,
    });
  }, []);

  return { ...state, publish, reset };
}
