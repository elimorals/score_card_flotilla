"use client";

import { MapContainer, TileLayer, ZoomControl, useMap } from "react-leaflet";
import { CDMX_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import "leaflet/dist/leaflet.css";

interface TransitMapProps {
  children?: React.ReactNode;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

function LocateControl() {
  const map = useMap();

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 });
  };

  return (
    <div className="absolute top-2 right-2 z-[1000] pointer-events-auto">
      <button
        onClick={handleLocate}
        className="bg-[#1a1a2e] border-2 border-white/20 rounded-md p-2 hover:bg-[#252545] transition-colors shadow-lg text-lg"
        title="Mi ubicacion"
      >
        📍
      </button>
    </div>
  );
}

export default function TransitMap({
  children,
  center = CDMX_CENTER,
  zoom = DEFAULT_ZOOM,
  className = "h-[calc(100vh-3.5rem)] w-full",
}: TransitMapProps) {
  return (
    <div className="relative w-full h-full">
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
        <LocateControl />
        {children}
      </MapContainer>
    </div>
  );
}
