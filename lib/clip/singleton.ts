import type { ZeroShotImageClassificationPipeline } from "@huggingface/transformers";

let classifier: ZeroShotImageClassificationPipeline | null = null;
let loading: Promise<ZeroShotImageClassificationPipeline> | null = null;

export async function getClassifier(): Promise<ZeroShotImageClassificationPipeline> {
  if (classifier) return classifier;

  if (!loading) {
    loading = (async () => {
      const { pipeline } = await import("@huggingface/transformers");
      const instance = await pipeline(
        "zero-shot-image-classification",
        "Xenova/clip-vit-base-patch32"
      );
      classifier = instance;
      return instance;
    })();
  }

  return loading;
}

export const POSITIVE_LABELS = [
  "a photo of a mushroom",
  "a photo of fungi growing in nature",
  "a photo of a fungus on wood",
  "a photo of nature outdoors with plants",
  "a photo of a forest floor",
];

export const NEGATIVE_LABELS = [
  "a screenshot of a website or app",
  "a photo of a person's face or selfie",
  "a photo of food on a plate in a restaurant",
  "a photo of text or a document",
  "a photo of an indoor room or furniture",
  "a meme or cartoon drawing",
  "an explicit or inappropriate photo",
];

export const ALL_LABELS = [...POSITIVE_LABELS, ...NEGATIVE_LABELS];

export const CONFIDENCE_THRESHOLD = 0.15;
