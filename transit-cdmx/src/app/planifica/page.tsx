"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const TransitMap = dynamic(() => import("@/components/TransitMap"), { ssr: false });
const RouteLayer = dynamic(() => import("@/components/RouteLayer"), { ssr: false });
import ChatPanel from "@/components/ChatPanel";

export default function PlanificaPage() {
  const [routesGeo, setRoutesGeo] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/data/routes-geo.json")
      .then((r) => r.json())
      .then(setRoutesGeo);
  }, []);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Sidebar - Chat */}
      <div className="w-full md:w-[400px] border-r border-white/10 bg-[#0a0a0a] z-10">
        <ChatPanel />
      </div>

      {/* Main Content - Map */}
      <div className="hidden md:block flex-1 relative">
        <TransitMap className="h-full w-full">
          {routesGeo && <RouteLayer data={routesGeo} opacity={0.4} weight={1.5} />}
        </TransitMap>
      </div>
    </div>
  );
}
