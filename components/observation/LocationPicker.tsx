"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useI18n } from "@/hooks/useI18n";

interface LocationPickerProps {
  gpsLat: number;
  gpsLng: number;
  pinLat: number | null;
  pinLng: number | null;
  radius: number;
  onPinChange: (lat: number, lng: number) => void;
  onRadiusChange: (radius: number) => void;
}

const RADIUS_OPTIONS = [
  { value: 50, label: "50 m" },
  { value: 100, label: "100 m" },
  { value: 250, label: "250 m" },
  { value: 500, label: "500 m" },
  { value: 1000, label: "1 km" },
];

const MAP_HEIGHT = 288; // h-72 = 18rem = 288px

export function LocationPicker({
  gpsLat,
  gpsLng,
  pinLat,
  pinLng,
  radius,
  onPinChange,
  onRadiusChange,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const boundaryRef = useRef<L.Circle | null>(null);
  const [ready, setReady] = useState(false);
  const [outOfBounds, setOutOfBounds] = useState(false);
  const { t } = useI18n();

  const radiusRef = useRef(radius);
  radiusRef.current = radius;

  const gpsRef = useRef({ lat: gpsLat, lng: gpsLng });
  gpsRef.current = { lat: gpsLat, lng: gpsLng };

  const isWithinBounds = useCallback((lat: number, lng: number) => {
    const R = 6371000;
    const dLat = ((lat - gpsRef.current.lat) * Math.PI) / 180;
    const dLng = ((lng - gpsRef.current.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((gpsRef.current.lat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const d = 2 * R * Math.asin(Math.sqrt(a));
    return d <= radiusRef.current;
  }, []);

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;

    // Force explicit height so Leaflet.remove() can't collapse the div
    container.style.height = `${MAP_HEIGHT}px`;

    let cancelled = false;
    let mapInstance: L.Map | null = null;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      // Ensure Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const map = L.map(mapRef.current, {
        center: [gpsLat, gpsLng],
        zoom: 16,
        zoomControl: true,
      });
      mapInstance = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const boundary = L.circle([gpsLat, gpsLng], {
        radius,
        color: "#6b7280",
        fillColor: "#10B981",
        fillOpacity: 0.08,
        weight: 2,
        dashArray: "6 4",
      }).addTo(map);
      boundaryRef.current = boundary;

      L.circleMarker([gpsLat, gpsLng], {
        radius: 6,
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 1,
        weight: 2,
      })
        .addTo(map)
        .bindTooltip(t("location.your_position"), { direction: "top", offset: [0, -8] });

      // Place pin if already set
      if (pinLat !== null && pinLng !== null) {
        const marker = L.marker([pinLat, pinLng], { draggable: true }).addTo(map);
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          if (isWithinBounds(pos.lat, pos.lng)) {
            setOutOfBounds(false);
            onPinChange(pos.lat, pos.lng);
          } else {
            setOutOfBounds(true);
            const prev =
              markerRef.current?.getLatLng() ??
              L.latLng(gpsRef.current.lat, gpsRef.current.lng);
            marker.setLatLng(prev);
            setTimeout(() => setOutOfBounds(false), 2000);
          }
        });
        markerRef.current = marker;
      }

      // Click to place/move pin
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;

        if (!isWithinBounds(clickLat, clickLng)) {
          setOutOfBounds(true);
          setTimeout(() => setOutOfBounds(false), 2000);
          return;
        }

        setOutOfBounds(false);

        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          const marker = L.marker([clickLat, clickLng], {
            draggable: true,
          }).addTo(map);
          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            if (isWithinBounds(pos.lat, pos.lng)) {
              setOutOfBounds(false);
              onPinChange(pos.lat, pos.lng);
            } else {
              setOutOfBounds(true);
              const prev =
                markerRef.current?.getLatLng() ??
                L.latLng(gpsRef.current.lat, gpsRef.current.lng);
              marker.setLatLng(prev);
              setTimeout(() => setOutOfBounds(false), 2000);
            }
          });
          markerRef.current = marker;
        }

        onPinChange(clickLat, clickLng);
      });

      leafletMapRef.current = map;
      setReady(true);

      // invalidateSize + fitBounds after the browser has laid out the container
      requestAnimationFrame(() => {
        map.invalidateSize();
        map.fitBounds(boundary.getBounds().pad(0.1));
      });
    });

    return () => {
      cancelled = true;
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
      leafletMapRef.current = null;
      markerRef.current = null;
      boundaryRef.current = null;
      setReady(false);
      // Restore container height after Leaflet.remove() strips internal elements
      if (container) {
        container.style.height = `${MAP_HEIGHT}px`;
        container.innerHTML = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync radius changes
  useEffect(() => {
    if (boundaryRef.current && leafletMapRef.current) {
      boundaryRef.current.setRadius(radius);
      leafletMapRef.current.fitBounds(
        boundaryRef.current.getBounds().pad(0.1)
      );
    }
  }, [radius]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div
          ref={mapRef}
          style={{ height: MAP_HEIGHT }}
          className="w-full rounded-xl border border-[var(--border)] overflow-hidden"
        />
        {!ready && (
          <div
            style={{ height: MAP_HEIGHT }}
            className="w-full rounded-xl border border-[var(--border)] flex items-center justify-center bg-[var(--muted)] absolute inset-0"
          >
            <p className="text-sm text-[var(--muted-foreground)]">
              Loading map...
            </p>
          </div>
        )}
        {outOfBounds && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg shadow-lg">
            {t("location.outside_area")}
          </div>
        )}
      </div>
      <p className="text-xs text-[var(--muted-foreground)]">
        {t("location.instruction")}
      </p>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          {t("location.allowed_radius")}
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onRadiusChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                radius === opt.value
                  ? "bg-forest text-white border-forest"
                  : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {t("location.radius_hint")}
        </p>
      </div>
    </div>
  );
}
