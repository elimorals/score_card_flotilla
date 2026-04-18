"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { WHEELCHAIR_COLORS } from "@/lib/constants";
import StopPopup from "./StopPopup";
import type { StopFeatureProperties } from "@/lib/types";

interface StopMarkersProps {
  data: GeoJSON.FeatureCollection;
  filterAgency?: string | null;
  filterAccessibility?: number | null;
  maxZoomToShow?: number;
}

export default function StopMarkers({
  data,
  filterAgency = null,
  filterAccessibility = null,
}: StopMarkersProps) {
  const filtered = data.features.filter((f) => {
    const p = f.properties as StopFeatureProperties;
    if (filterAgency && !p.agencies.includes(filterAgency)) return false;
    if (filterAccessibility !== null && p.wheelchair_boarding !== filterAccessibility)
      return false;
    return true;
  });

  return (
    <>
      {filtered.map((feature) => {
        const p = feature.properties as StopFeatureProperties;
        const [lon, lat] = (feature.geometry as GeoJSON.Point).coordinates;
        const color = WHEELCHAIR_COLORS[p.wheelchair_boarding] || "#6b7280";

        return (
          <CircleMarker
            key={p.stop_id}
            center={[lat, lon]}
            radius={4}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.7,
              weight: 1,
            }}
          >
            <Popup>
              <StopPopup properties={p} />
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
