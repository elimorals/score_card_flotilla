"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import AgencyLegend from "@/components/AgencyLegend";

const TransitMap = dynamic(() => import("@/components/TransitMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-3.5rem)] w-full bg-[#1a1a2e] flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">Cargando mapa...</div>
    </div>
  ),
});
const RouteLayer = dynamic(() => import("@/components/RouteLayer"), { ssr: false });
const StopMarkers = dynamic(() => import("@/components/StopMarkers"), { ssr: false });

function MapContent() {
  const searchParams = useSearchParams();
  const agencyParam = searchParams.get("agency");

  const [routesGeo, setRoutesGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [stopsGeo, setStopsGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [showOnlyAccessible, setShowOnlyAccessible] = useState(false);
  const [agencies, setAgencies] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/data/routes-geo.json").then((r) => r.json()),
      fetch("/data/stops-geo.json").then((r) => r.json()),
    ]).then(([routes, stops]) => {
      setRoutesGeo(routes);
      setStopsGeo(stops);
      const uniqueAgencies = [
        ...new Set(
          routes.features.map(
            (f: GeoJSON.Feature) => f.properties?.agency_id as string
          )
        ),
      ] as string[];
      setAgencies(uniqueAgencies.sort());
    });
  }, []);

  // Sincronizar parámetro de URL con estado local
  useEffect(() => {
    if (agencyParam) {
      setSelectedAgency(agencyParam);
    }
  }, [agencyParam]);

  if (!routesGeo || !stopsGeo) {
    return (
      <div className="h-[calc(100vh-3.5rem)] w-full bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-gray-400 animate-pulse text-lg">Cargando Transit CDMX...</div>
      </div>
    );
  }

  // Filtrar paradas accesibles si el toggle está activo
  const filteredStops = showOnlyAccessible
    ? {
        ...stopsGeo,
        features: stopsGeo.features.filter(
          (f) => f.properties?.wheelchair_boarding === 1
        ),
      }
    : stopsGeo;

  return (
    <div className="relative">
      <AgencyLegend
        agencies={agencies}
        selectedAgency={selectedAgency}
        onSelectAgency={setSelectedAgency}
      />
      
      {/* Botón flotante de Accesibilidad */}
      <div className="absolute top-4 right-16 z-[1000]">
        <button
          onClick={() => setShowOnlyAccessible(!showOnlyAccessible)}
          className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all border ${
            showOnlyAccessible 
              ? "bg-green-600 border-green-400 text-white" 
              : "bg-[#1a1a2e] border-white/20 text-gray-400 hover:text-white"
          }`}
        >
          {showOnlyAccessible ? "♿ Solo Accesibles" : "♿ Ver todo"}
        </button>
      </div>

      <TransitMap>
        <RouteLayer data={routesGeo} filterAgency={selectedAgency} />
        <StopMarkers data={filteredStops} filterAgency={selectedAgency} />
      </TransitMap>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <MapContent />
    </Suspense>
  );
}
