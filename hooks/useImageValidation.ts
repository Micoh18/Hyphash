"use client";

import { useCallback, useState } from "react";

export interface ValidationResult {
  valid: boolean;
  confidence: number;
  topLabel: string;
}

export function useImageValidation() {
  const [validating, setValidating] = useState(false);

  const validate = useCallback(async (file: File): Promise<ValidationResult> => {
    setValidating(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/validate-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Validation failed: ${res.status}`);
      }

      return await res.json();
    } catch {
      // If validation service is unavailable, allow the upload
      return { valid: true, confidence: 0, topLabel: "validation_unavailable" };
    } finally {
      setValidating(false);
    }
  }, []);

  return { validate, validating };
}
