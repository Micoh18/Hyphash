import L from "leaflet";
import type { ObservationStatus } from "@/types";
import { STATUS_COLORS } from "@/types";

export function createMarkerIcon(status: ObservationStatus): L.DivIcon {
  const color = STATUS_COLORS[status];
  return L.divIcon({
    className: "custom-marker",
    html: `
      <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="14" cy="12" r="5" fill="white" opacity="0.9"/>
        <circle cx="14" cy="12" r="2.5" fill="${color}"/>
      </svg>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

export const DEFAULT_CENTER: [number, number] = [40.4168, -3.7038]; // Madrid
export const DEFAULT_ZOOM = 12;
