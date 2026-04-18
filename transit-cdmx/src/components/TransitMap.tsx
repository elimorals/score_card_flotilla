"use client";

import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { CDMX_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import "leaflet/dist/leaflet.css";

interface TransitMapProps {
  children?: React.ReactNode;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function TransitMap({
  children,
  center = CDMX_CENTER,
  zoom = DEFAULT_ZOOM,
  className = "h-[calc(100vh-3.5rem)] w-full",
}: TransitMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      className={className}
      style={{ background: "#1a1a2e" }}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {children}
    </MapContainer>
  );
}
