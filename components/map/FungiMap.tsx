"use client";

import { useEffect, useState } from "react";
import type { Observation, ObservationStatus } from "@/types";
import { useObservations } from "@/hooks/useObservations";
import { useI18n } from "@/hooks/useI18n";
import { MapFilters } from "./MapFilters";
import Link from "next/link";

let MapContainer: typeof import("react-leaflet").MapContainer;
let TileLayer: typeof import("react-leaflet").TileLayer;
let Marker: typeof import("react-leaflet").Marker;
let Popup: typeof import("react-leaflet").Popup;
let useMap: typeof import("react-leaflet").useMap;

function NearMeButton() {
  const map = useMap!();
  const { t } = useI18n();
  const [locating, setLocating] = useState(false);

  const handleClick = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 14);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <button
      onClick={handleClick}
      disabled={locating}
      className="absolute bottom-24 right-4 z-[1000] bg-[var(--card)] text-[var(--foreground)] rounded-full w-12 h-12 flex items-center justify-center shadow-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
      title={t("map.near_me")}
      aria-label="Near me - find observations near your location"
    >
      {locating ? (
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeLinecap="round" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a1 1 0 011 1v2.07A8.001 8.001 0 0118.93 11H21a1 1 0 110 2h-2.07A8.001 8.001 0 0113 18.93V21a1 1 0 11-2 0v-2.07A8.001 8.001 0 015.07 13H3a1 1 0 110-2h2.07A8.001 8.001 0 0111 5.07V3a1 1 0 011-1z" />
        </svg>
      )}
    </button>
  );
}

function ObservationPopup({ observation }: { observation: Observation }) {
  const { t } = useI18n();
  const species =
    observation.verified_species ??
    observation.proposed_species ??
    t("common.unknown_species");
  const statusColors: Record<string, string> = {
    unverified: "bg-gray-200 text-gray-700",
    discussing: "bg-amber-100 text-amber-800",
    community_id: "bg-forest/10 text-forest",
    unknown: "bg-violet-100 text-violet-800",
  };

  return (
    <div className="observation-popup">
      <h3 className="text-sm font-semibold italic">{species}</h3>
      <p className="text-xs text-gray-500 mt-0.5">
        {observation.observer?.username ?? t("common.anonymous")} &middot;{" "}
        {new Date(observation.observed_at).toLocaleDateString()}
      </p>
      <span
        className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[observation.status]}`}
      >
        {t(`status.${observation.status}`)}
      </span>
      {observation.notes && (
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
          {observation.notes}
        </p>
      )}
      <Link
        href={`/observation/${observation.id}`}
        className="block mt-2 text-xs font-medium text-forest hover:text-forest-light"
      >
        {t("common.view_details")}
      </Link>
    </div>
  );
}

export default function FungiMap() {
  const { filteredObservations } = useObservations();
  const { t } = useI18n();
  const [ready, setReady] = useState(false);
  const [markerIconFn, setMarkerIconFn] = useState<{
    fn: (status: ObservationStatus) => L.DivIcon;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      import("react-leaflet"),
      import("@/lib/map/utils"),
    ]).then(([rl, utils]) => {
      MapContainer = rl.MapContainer;
      TileLayer = rl.TileLayer;
      Marker = rl.Marker;
      Popup = rl.Popup;
      useMap = rl.useMap;
      setMarkerIconFn({ fn: utils.createMarkerIcon });
      setReady(true);
    });
  }, []);

  if (!ready || !MapContainer) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--background)]" style={{ minHeight: "300px" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--border)] border-t-forest animate-spin" />
          <p className="text-sm text-[var(--muted-foreground)]">{t("common.loading_map")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 z-[1000] pointer-events-auto">
        <MapFilters />
      </div>
      <MapContainer
        center={[40.4168, -3.7038]}
        zoom={12}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {filteredObservations.map((obs) => (
          <Marker
            key={obs.id}
            position={[obs.latitude, obs.longitude]}
            icon={markerIconFn!.fn(obs.status)}
          >
            <Popup>
              <ObservationPopup observation={obs} />
            </Popup>
          </Marker>
        ))}
        <NearMeButton />
      </MapContainer>
    </div>
  );
}
