"use client";

import dynamic from "next/dynamic";

const FungiMap = dynamic(() => import("@/components/map/FungiMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--border)] border-t-forest animate-spin" />
        <p className="text-sm text-[var(--muted-foreground)]">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="absolute inset-0">
      <FungiMap />
    </div>
  );
}
