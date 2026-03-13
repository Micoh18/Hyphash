"use client";

import dynamic from "next/dynamic";

const FungiMap = dynamic(() => import("@/components/map/FungiMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="text-4xl mb-4">🍄</div>
        <p className="text-[var(--muted-foreground)]">Loading map...</p>
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
