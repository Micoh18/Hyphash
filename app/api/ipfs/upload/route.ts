import { NextResponse } from "next/server";
import { uploadFile, uploadJSON, buildObservationMetadata, isConfigured } from "@/lib/ipfs/client";
import { createClient } from "@/lib/supabase/server";
import { apiGuard, userRateLimit } from "@/lib/api-guard";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 6;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

// 20 uploads per hour per IP
const GUARD_CONFIG = { limit: 20, windowSeconds: 3600, route: "ipfs-upload" };

export async function POST(request: Request) {
  const guard = apiGuard(request, GUARD_CONFIG);
  if (guard.blocked) return guard.response;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // User-based rate limit: 20 uploads per hour per user
  const userLimit = userRateLimit(user.id, "ipfs-upload", 20, 3600);
  if (userLimit.blocked) return userLimit.response;

  if (!isConfigured()) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const images = formData.getAll("images") as File[];
    const metadataRaw = formData.get("metadata") as string | null;

    if (!metadataRaw) {
      return NextResponse.json({ error: "metadata field required" }, { status: 400 });
    }

    if (images.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed` }, { status: 400 });
    }

    for (const image of images) {
      if (image.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File exceeds 10MB limit` }, { status: 400 });
      }
      if (!ALLOWED_TYPES.includes(image.type)) {
        return NextResponse.json({ error: `File type not allowed` }, { status: 400 });
      }
    }

    let observationData: Record<string, unknown>;
    try {
      observationData = JSON.parse(metadataRaw);
    } catch {
      return NextResponse.json({ error: "Invalid metadata JSON" }, { status: 400 });
    }

    const photoCids: string[] = [];
    for (const image of images) {
      const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
      const result = await uploadFile(image, `mycelium-photo-${safeName}`);
      photoCids.push(result.cid);
    }

    const metadata = buildObservationMetadata({
      ...(observationData as Parameters<typeof buildObservationMetadata>[0]),
      photo_cids: photoCids,
    });
    const safeId = String(observationData.id ?? "unknown").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50);
    const metaResult = await uploadJSON(metadata, `mycelium-obs-${safeId}`);

    return NextResponse.json({
      photoCids,
      metadataCid: metaResult.cid,
      metadataUrl: metaResult.url,
    });
  } catch (error) {
    console.error("IPFS upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
