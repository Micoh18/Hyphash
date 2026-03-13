import { NextResponse } from "next/server";
import { uploadFile, uploadJSON, buildObservationMetadata, isConfigured } from "@/lib/ipfs/client";

/**
 * POST /api/ipfs/upload
 *
 * Accepts FormData with:
 * - images: File[] — observation photos
 * - metadata: string (JSON) — observation details for metadata upload
 *
 * Returns { photoCids: string[], metadataCid: string, metadataUrl: string }
 */
export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "IPFS not configured. Set PINATA_API_KEY and PINATA_SECRET_KEY." },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const images = formData.getAll("images") as File[];
    const metadataRaw = formData.get("metadata") as string | null;

    if (!metadataRaw) {
      return NextResponse.json({ error: "metadata field required" }, { status: 400 });
    }

    const observationData = JSON.parse(metadataRaw);

    // 1. Upload all photos to IPFS
    const photoCids: string[] = [];
    for (const image of images) {
      const result = await uploadFile(image, `mycelium-photo-${image.name}`);
      photoCids.push(result.cid);
    }

    // 2. Build and upload metadata JSON
    const metadata = buildObservationMetadata({
      ...observationData,
      photo_cids: photoCids,
    });
    const metaResult = await uploadJSON(metadata, `mycelium-obs-${observationData.id}`);

    return NextResponse.json({
      photoCids,
      metadataCid: metaResult.cid,
      metadataUrl: metaResult.url,
    });
  } catch (error) {
    console.error("IPFS upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "IPFS upload failed" },
      { status: 500 }
    );
  }
}
