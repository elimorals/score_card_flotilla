"use client";

import { useState, useEffect } from "react";
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

export default function HomePage() {
  const [routesGeo, setRoutesGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [stopsGeo, setStopsGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
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

  if (!routesGeo || !stopsGeo) {
    return (
      <div className="h-[calc(100vh-3.5rem)] w-full bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-gray-400 animate-pulse text-lg">
          Cargando Transit CDMX...
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AgencyLegend
        agencies={agencies}
        selectedAgency={selectedAgency}
        onSelectAgency={setSelectedAgency}
      />
      <TransitMap>
        <RouteLayer data={routesGeo} filterAgency={selectedAgency} />
        {selectedAgency && (
          <StopMarkers data={stopsGeo} filterAgency={selectedAgency} />
        )}
      </TransitMap>
    </div>
  );
}
