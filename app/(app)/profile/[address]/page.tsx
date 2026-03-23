"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useObservations } from "@/hooks/useObservations";
import { useI18n } from "@/hooks/useI18n";
import { ObservationCard } from "@/components/observation/ObservationCard";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { Profile, ObservationStatus } from "@/types";
import { STATUS_COLORS } from "@/types";

/* Mini-map showing user's observation locations */
function ProfileMiniMap({ points }: { points: { lat: number; lng: number; status: ObservationStatus }[] }) {
  const [ready, setReady] = useState(false);
  const [components, setComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    CircleMarker: typeof import("react-leaflet").CircleMarker;
  } | null>(null);

  useEffect(() => {
    import("react-leaflet").then((rl) => {
      setComponents({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        CircleMarker: rl.CircleMarker,
      });
      setReady(true);
    });
  }, []);

  if (!ready || !components || points.length === 0) {
    return (
      <div className="w-full h-48 rounded-xl bg-[var(--muted)] flex items-center justify-center">
        {points.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No locations to show</p>
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-forest animate-spin" />
        )}
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker } = components;

  // Calculate bounds center
  const avgLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const avgLng = points.reduce((s, p) => s + p.lng, 0) / points.length;

  return (
    <div className="w-full h-48 rounded-xl overflow-hidden border border-[var(--border)]">
      <MapContainer
        center={[avgLat, avgLng]}
        zoom={points.length === 1 ? 12 : 10}
        className="w-full h-full"
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        {points.map((p, i) => (
          <CircleMarker
            key={i}
            center={[p.lat, p.lng]}
            radius={6}
            pathOptions={{
              fillColor: STATUS_COLORS[p.status],
              fillOpacity: 0.8,
              color: "#fff",
              weight: 2,
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const supabase = useMemo(() => createClient(), []);
  const { observations } = useObservations();
  const { t } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("stellar_address", address)
        .single();
      if (data) setProfile(data as Profile);
      setProfileLoading(false);
    }
    fetchProfile();
  }, [address]);

  const userObs = observations.filter((o) => {
    if (profile) return o.observer_id === profile.id;
    return false;
  });

  const verifiedCount = userObs.filter(
    (o) => o.status === "community_id"
  ).length;
  const speciesSet = new Set(
    userObs
      .map((o) => o.verified_species ?? o.proposed_species)
      .filter(Boolean)
  );

  // Habitat diversity
  const habitats = new Set(userObs.map((o) => o.habitat).filter(Boolean));
  const substrates = new Set(userObs.map((o) => o.substrate).filter(Boolean));

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--border)] border-t-forest animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-[var(--muted-foreground)] opacity-40">
            <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <p className="text-[var(--foreground)] font-medium">
            {t("profile.not_found")}
          </p>
          <Link
            href="/map"
            className="text-sm text-forest hover:text-forest-light mt-2 block"
          >
            {t("common.back_to_map")}
          </Link>
        </div>
      </div>
    );
  }

  const mapPoints = userObs.map((o) => ({
    lat: o.latitude,
    lng: o.longitude,
    status: o.status,
  }));

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link
            href="/map"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {t("detail.map_back")}
          </Link>
          <h1 className="font-semibold text-[var(--foreground)]">{t("profile.title")}</h1>
          <div className="w-12" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Identity */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-spore-light flex items-center justify-center text-xl font-bold text-bark flex-shrink-0">
            {(profile.username ?? "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[var(--foreground)] truncate">
              {profile.username ?? t("profile.anonymous")}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] font-mono">
              {profile.stellar_address.slice(0, 8)}...{profile.stellar_address.slice(-8)}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {t("profile.joined")} {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Observation map */}
        {userObs.length > 0 && <ProfileMiniMap points={mapPoints} />}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {userObs.length}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {t("common.observations")}
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <div className="text-2xl font-bold text-moss">
              {verifiedCount}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {t("common.verified")}
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <div className="text-2xl font-bold text-spore">
              {speciesSet.size}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {t("common.species")}
            </div>
          </div>
        </div>

        {/* Diversity tags — what habitats/substrates has this user explored */}
        {(habitats.size > 0 || substrates.size > 0) && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">
              {t("profile.explored") || "Explored"}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[...habitats].map((h) => (
                <span key={h} className="px-2.5 py-1 rounded-full text-xs bg-forest/10 text-forest font-medium">
                  {h}
                </span>
              ))}
              {[...substrates].map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-mycelium/10 text-mycelium font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Species list */}
        {speciesSet.size > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">
              {t("profile.species_documented") || "Species documented"}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[...speciesSet].map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-spore/15 text-mycelium font-medium italic">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Observations list */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            {t("common.observations")}
          </h3>
          {userObs.length === 0 ? (
            <div className="text-center py-12">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3 text-[var(--muted-foreground)] opacity-30">
                <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <p className="text-sm text-[var(--muted-foreground)]">
                {t("profile.no_observations")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {userObs.map((obs) => (
                <ObservationCard key={obs.id} observation={obs} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
