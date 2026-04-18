"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const TransitMap = dynamic(() => import("@/components/TransitMap"), { ssr: false });
const RouteLayer = dynamic(() => import("@/components/RouteLayer"), { ssr: false });
import ChatPanel from "@/components/ChatPanel";
import type { RouteFeatureProperties } from "@/lib/types";

export default function PlanificaPage() {
  const [routesGeo, setRoutesGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [highlightedRoutes, setHighlightedRoutes] = useState<string[]>([]);

  useEffect(() => {
    fetch("/data/routes-geo.json")
      .then((r) => r.json())
      .then(setRoutesGeo);
  }, []);

  // Función para resaltar rutas desde el chat
  const handleHighlight = (routeIds: string[]) => {
    setHighlightedRoutes(routeIds);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Sidebar - Chat */}
      <div className="w-full md:w-[400px] border-r border-white/10 bg-[#0a0a0a] z-10">
        <ChatPanel onHighlight={handleHighlight} />
      </div>

      {/* Main Content - Map */}
      <div className="hidden md:block flex-1 relative">
        <TransitMap className="h-full w-full">
          {routesGeo && (
            <RouteLayer 
              data={routesGeo} 
              opacity={0.1} 
              weight={1.5} 
              highlightedIds={highlightedRoutes}
            />
          )}
        </TransitMap>
        
        {highlightedRoutes.length > 0 && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-[#1a1a2e]/90 border border-[#e8734a] p-2 rounded-lg text-xs text-white">
            📍 Ruta resaltada por la IA
            <button 
              onClick={() => setHighlightedRoutes([])}
              className="ml-2 underline text-gray-400"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
