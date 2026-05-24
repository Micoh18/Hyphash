import { NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";

// 60 validations per minute per IP (image validation is lightweight-ish)
const GUARD_CONFIG = { limit: 60, windowSeconds: 60, route: "validate-image" };
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const guard = apiGuard(request, GUARD_CONFIG);
  if (guard.blocked) return guard.response;

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    if (file.type && !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // Vercel Serverless Functions have a 250 MB unzipped bundle limit.
    // @huggingface/transformers pulls onnxruntime-node (~400 MB), so the public
    // deploy uses a conservative availability fallback while local/worker
    // environments can still run the full CLIP validator.
    if (process.env.VERCEL === "1") {
      return NextResponse.json({
        valid: true,
        confidence: 0,
        topLabel: "serverless_validation_unavailable",
        scores: {},
      });
    }

    const [clip, transformers] = await Promise.all([
      import("@/lib/clip/singleton"),
      import("@huggingface/transformers"),
    ]);

    const arrayBuffer = await file.arrayBuffer();
    const image = await transformers.RawImage.fromBlob(new Blob([arrayBuffer]));

    const classifier = await clip.getClassifier();
    const raw = await classifier(image, clip.ALL_LABELS);
    const results = (Array.isArray(raw) ? raw : [raw]).flat() as Array<{ label: string; score: number }>;

    const scores: Record<string, number> = {};
    for (const r of results) {
      scores[r.label] = r.score;
    }

    const topResult = results[0];
    const isPositive = clip.POSITIVE_LABELS.includes(topResult.label);
    const bestPositiveScore = Math.max(
      ...clip.POSITIVE_LABELS.map((l) => scores[l] ?? 0)
    );

    const valid = isPositive || bestPositiveScore >= clip.CONFIDENCE_THRESHOLD;

    return NextResponse.json({
      valid,
      confidence: bestPositiveScore,
      topLabel: topResult.label,
      scores,
    });
  } catch (error) {
    console.error("Image validation error:", error);
    return NextResponse.json({
      valid: true,
      confidence: 0,
      topLabel: "validation_unavailable",
      scores: {},
    });
  }
}
