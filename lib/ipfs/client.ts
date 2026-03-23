import "server-only";

/**
 * IPFS upload service via Pinata.
 * Requires PINATA_API_KEY and PINATA_SECRET_KEY env vars.
 */

const PINATA_API = "https://api.pinata.cloud";

function getHeaders() {
  const apiKey = process.env.PINATA_API_KEY;
  const secret = process.env.PINATA_SECRET_KEY;

  if (!apiKey || !secret) {
    throw new Error("PINATA_API_KEY and PINATA_SECRET_KEY must be set");
  }

  return {
    pinata_api_key: apiKey,
    pinata_secret_api_key: secret,
  };
}

export function isConfigured(): boolean {
  return !!(process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY);
}

/**
 * Upload a file (image) to IPFS via Pinata.
 * Returns the IPFS CID (content identifier).
 */
export async function uploadFile(
  file: File,
  name?: string
): Promise<{ cid: string; url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  if (name) {
    formData.append(
      "pinataMetadata",
      JSON.stringify({ name })
    );
  }

  const res = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata upload failed: ${err}`);
  }

  const data = await res.json();
  return {
    cid: data.IpfsHash,
    url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  };
}

/**
 * Upload JSON metadata to IPFS via Pinata.
 * Used for observation metadata (linked from the NFT).
 */
export async function uploadJSON(
  json: Record<string, unknown>,
  name?: string
): Promise<{ cid: string; url: string }> {
  const body = {
    pinataContent: json,
    pinataMetadata: { name: name ?? "metadata.json" },
  };

  const res = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata JSON upload failed: ${err}`);
  }

  const data = await res.json();
  return {
    cid: data.IpfsHash,
    url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  };
}

/**
 * Build the observation metadata JSON for IPFS.
 * Follows a structure similar to NFT metadata standards.
 */
export function buildObservationMetadata(observation: {
  id: string;
  species?: string | null;
  location: { lat: number; lng: number };
  observed_at: string;
  observer_address?: string;
  notes?: string | null;
  photo_cids: string[];
}) {
  return {
    name: `Mycelium Observation #${observation.id}`,
    description: observation.notes ?? "Fungi observation on Mycelium",
    species: observation.species ?? "Unknown",
    location: observation.location,
    observed_at: observation.observed_at,
    observer: observation.observer_address ?? "anonymous",
    images: observation.photo_cids.map((cid) => `ipfs://${cid}`),
    platform: "Mycelium",
    version: "0.1",
    created_at: new Date().toISOString(),
  };
}
