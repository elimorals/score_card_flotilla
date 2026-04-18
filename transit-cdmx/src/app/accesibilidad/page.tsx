"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { WHEELCHAIR_COLORS, WHEELCHAIR_LABELS } from "@/lib/constants";
import type { TransitStats } from "@/lib/types";

const TransitMap = dynamic(() => import("@/components/TransitMap"), { ssr: false });
const RouteLayer = dynamic(() => import("@/components/RouteLayer"), { ssr: false });
const StopMarkers = dynamic(() => import("@/components/StopMarkers"), { ssr: false });

export default function AccesibilidadPage() {
  const [routesGeo, setRoutesGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [stopsGeo, setStopsGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [stats, setStats] = useState<TransitStats | null>(null);
  const [filter, setFilter] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/data/routes-geo.json").then((r) => r.json()),
      fetch("/data/stops-geo.json").then((r) => r.json()),
      fetch("/data/stats.json").then((r) => r.json()),
    ]).then(([routes, stops, statsData]) => {
      setRoutesGeo(routes);
      setStopsGeo(stops);
      setStats(statsData);
    });
  }, []);

  if (!routesGeo || !stopsGeo || !stats) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Cargando datos de accesibilidad...</div>
      </div>
    );
  }

  const accessPercent = ((stats.accessibleStops / stats.totalStops) * 100).toFixed(1);
  const notAccessPercent = ((stats.notAccessibleStops / stats.totalStops) * 100).toFixed(1);
  const unknownPercent = ((stats.unknownAccessibilityStops / stats.totalStops) * 100).toFixed(1);

  return (
    <div className="relative">
      {/* Info Panel */}
      <div className="absolute top-4 left-4 z-[500] bg-[#0a0a0a]/95 backdrop-blur rounded-lg border border-white/10 shadow-2xl transition-all duration-300 w-[280px] sm:w-72">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 sm:cursor-default"
        >
          <h2 className="text-lg font-bold text-[#e8734a]">
            ♿ Accesibilidad
          </h2>
          <span className="sm:hidden text-gray-400">{isOpen ? "▲" : "▼"}</span>
        </button>

        <div className={`${isOpen ? "block" : "hidden sm:block"} p-4 pt-0 border-t border-white/5`}>
          <p className="text-xs text-gray-400 mb-3">
            Accesibilidad para silla de ruedas en {stats.totalStops.toLocaleString()} paradas de transporte publico.
          </p>

          {/* Stats */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: WHEELCHAIR_COLORS[1] }} />
                Accesibles
              </span>
              <span className="text-green-400 font-mono">{stats.accessibleStops.toLocaleString()} ({accessPercent}%)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: WHEELCHAIR_COLORS[2] }} />
                No accesibles
              </span>
              <span className="text-red-400 font-mono">{stats.notAccessibleStops.toLocaleString()} ({notAccessPercent}%)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: WHEELCHAIR_COLORS[0] }} />
                Sin informacion
              </span>
              <span className="text-gray-400 font-mono">{stats.unknownAccessibilityStops.toLocaleString()} ({unknownPercent}%)</span>
            </div>
          </div>

          {/* Filters */}
          <div className="border-t border-white/10 pt-3">
            <h3 className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Filtrar</h3>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setFilter(null)}
                className={`text-[10px] px-2 py-1 rounded transition-colors ${
                  filter === null ? "bg-[#e8734a] text-white" : "bg-white/10 text-gray-400"
                }`}
              >
                Todas
              </button>
              {[1, 2, 0].map((val) => (
                <button
                  key={val}
                  onClick={() => setFilter(filter === val ? null : val)}
                  className={`text-[10px] px-2 py-1 rounded transition-colors ${
                    filter === val ? "bg-[#e8734a] text-white" : "bg-white/10 text-gray-400"
                  }`}
                >
                  {WHEELCHAIR_LABELS[val]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TransitMap>
        <RouteLayer data={routesGeo} opacity={0.3} weight={1.5} />
        <StopMarkers data={stopsGeo} filterAccessibility={filter} />
      </TransitMap>
    </div>
  );
}
