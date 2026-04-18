"use client";

import { GeoJSON } from "react-leaflet";
import type { PathOptions } from "leaflet";
import type { RouteFeatureProperties } from "@/lib/types";

interface RouteLayerProps {
  data: GeoJSON.FeatureCollection;
  opacity?: number;
  weight?: number;
  filterAgency?: string | null;
  highlightedIds?: string[];
  onRouteClick?: (properties: RouteFeatureProperties) => void;
}

export default function RouteLayer({
  data,
  opacity = 0.8,
  weight = 2.5,
  filterAgency = null,
  highlightedIds = [],
  onRouteClick,
}: RouteLayerProps) {
  const filteredData: GeoJSON.FeatureCollection = filterAgency
    ? {
        type: "FeatureCollection",
        features: data.features.filter(
          (f) => f.properties?.agency_id === filterAgency
        ),
      }
    : data;

  return (
    <GeoJSON
      key={JSON.stringify(highlightedIds) + (filterAgency || "all")}
      data={filteredData}
      style={(feature) => {
        const p = feature?.properties as RouteFeatureProperties;
        const isHighlighted = highlightedIds.includes(p?.route_id);
        
        const color = p?.route_color
          ? `#${p.route_color}`
          : "#888888";
          
        return {
          color,
          weight: isHighlighted ? weight * 3 : weight,
          opacity: isHighlighted ? 1 : opacity,
          lineJoin: "round",
          lineCap: "round",
          zIndex: isHighlighted ? 1000 : 1,
        } as PathOptions;
      }}
      onEachFeature={(feature, layer) => {
        const p = feature.properties as RouteFeatureProperties;
        layer.bindPopup(
          `<div>
            <strong class="text-base">${p.route_short_name}</strong>
            <div class="text-sm text-gray-300 mt-1">${p.route_long_name}</div>
            <div class="text-xs text-gray-400 mt-1">${p.agency_id}</div>
          </div>`
        );
        if (onRouteClick) {
          layer.on("click", () => onRouteClick(p));
        }
      }}
    />
  );
}
