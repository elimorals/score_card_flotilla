"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { FrequencyIndex } from "@/lib/types";
import { formatTime, formatHeadway } from "@/lib/geo-utils";
import { AGENCY_NAMES } from "@/lib/constants";

const TransitMap = dynamic(() => import("@/components/TransitMap"), { ssr: false });
const RouteLayer = dynamic(() => import("@/components/RouteLayer"), { ssr: false });

export default function NocturnoPage() {
  const [nightGeo, setNightGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [stopsGeo, setStopsGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [freqIndex, setFreqIndex] = useState<FrequencyIndex | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/data/night-routes.json").then((r) => r.json()),
      fetch("/data/stops-geo.json").then((r) => r.json()),
      fetch("/data/frequencies-index.json").then((r) => r.json()),
    ]).then(([night, stops, freq]) => {
      setNightGeo(night);
      setStopsGeo(stops);
      setFreqIndex(freq);
    });
  }, []);

  if (!nightGeo || !stopsGeo || !freqIndex) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Cargando rutas nocturnas...</div>
      </div>
    );
  }

  // Get night routes info from freqIndex
  const nightRouteIds = [
    ...new Set(nightGeo.features.map((f) => f.properties?.route_id as string)),
  ];

  const nightRouteInfos = nightRouteIds
    .map((rid) => {
      const info = freqIndex[rid];
      if (!info) return null;
      const nightFreqs = info.frequencies.filter((f) => {
        const hour = parseInt(f.start_time.split(":")[0]);
        return hour >= 24;
      });
      return { route_id: rid, ...info, nightFrequencies: nightFreqs };
    })
    .filter(Boolean);

  // Filter stops that belong to night routes
  // const nightAgencies = new Set(nightRouteInfos.map((r) => r!.agency_id));

  return (
    <div className="relative">
      {/* Night Info Panel */}
      <div className="absolute top-4 left-4 z-[500] bg-[#0a0a0a]/95 backdrop-blur rounded-lg border border-white/10 shadow-2xl transition-all duration-300 w-[280px] sm:w-80">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 sm:cursor-default"
        >
          <h2 className="text-lg font-bold text-purple-400">
            🌙 Nocturno CDMX
          </h2>
          <span className="sm:hidden text-gray-400">{isOpen ? "▲" : "▼"}</span>
        </button>

        <div className={`${isOpen ? "block" : "hidden sm:block"} p-4 pt-0 max-h-[60vh] overflow-y-auto border-t border-white/5`}>
          <p className="text-xs text-gray-400 mb-4">
            {nightRouteIds.length} rutas con servicio despues de medianoche
          </p>

          <div className="space-y-3">
            {nightRouteInfos.map((route) => {
              if (!route) return null;
              return (
                <div
                  key={route.route_id}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-bold text-white">
                        {route.route_short_name}
                      </span>
                      <span className="text-[10px] text-gray-500 ml-2 uppercase">
                        {AGENCY_NAMES[route.agency_id] || route.agency_id}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-300 mt-1 leading-tight">
                    {route.route_long_name}
                  </div>
                  {route.nightFrequencies.length > 0 && (
                    <div className="text-[10px] text-purple-300 mt-2 font-mono">
                      {formatTime(route.nightFrequencies[0].start_time)} -{" "}
                      {formatTime(route.nightFrequencies[0].end_time)} | cada{" "}
                      {formatHeadway(route.nightFrequencies[0].headway_secs)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <TransitMap>
        <RouteLayer data={nightGeo} weight={3} opacity={0.9} />
      </TransitMap>
    </div>
  );
}
