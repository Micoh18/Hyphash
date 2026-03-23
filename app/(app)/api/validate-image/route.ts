import { NextResponse } from "next/server";
import {
  getClassifier,
  ALL_LABELS,
  POSITIVE_LABELS,
  CONFIDENCE_THRESHOLD,
} from "@/lib/clip/singleton";
import { RawImage } from "@huggingface/transformers";
import { apiGuard } from "@/lib/api-guard";

// 60 validations per minute per IP (image validation is lightweight-ish)
const GUARD_CONFIG = { limit: 60, windowSeconds: 60, route: "validate-image" };

export async function POST(request: Request) {
  const guard = apiGuard(request, GUARD_CONFIG);
  if (guard.blocked) return guard.response;

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Reject files over 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const image = await RawImage.fromBlob(new Blob([arrayBuffer]));

    const classifier = await getClassifier();
    const raw = await classifier(image, ALL_LABELS);
    const results = (Array.isArray(raw) ? raw : [raw]).flat() as Array<{ label: string; score: number }>;

    const scores: Record<string, number> = {};
    for (const r of results) {
      scores[r.label] = r.score;
    }

    const topResult = results[0];
    const isPositive = POSITIVE_LABELS.includes(topResult.label);
    const bestPositiveScore = Math.max(
      ...POSITIVE_LABELS.map((l) => scores[l] ?? 0)
    );

    const valid = isPositive || bestPositiveScore >= CONFIDENCE_THRESHOLD;

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
