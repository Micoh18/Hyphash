import { NextResponse } from "next/server";
import {
  getClassifier,
  ALL_LABELS,
  POSITIVE_LABELS,
  CONFIDENCE_THRESHOLD,
} from "@/lib/clip/singleton";
import { RawImage } from "@huggingface/transformers";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
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
    // Graceful degradation — if CLIP fails, allow the upload
    return NextResponse.json({
      valid: true,
      confidence: 0,
      topLabel: "validation_unavailable",
      scores: {},
    });
  }
}
