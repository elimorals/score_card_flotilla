"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import StatsCard from "@/components/StatsCard";
import { AGENCY_COLORS, AGENCY_NAMES } from "@/lib/constants";
import type { TransitStats } from "@/lib/types";

export default function PulsoPage() {
  const [stats, setStats] = useState<TransitStats | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/data/stats.json")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  const routesByAgencyData = stats.routesByAgency.map((d) => ({
    name: AGENCY_NAMES[d.agency] || d.agency,
    id: d.agency,
    value: d.count,
    color: AGENCY_COLORS[d.agency] || "#888",
  }));

  const handleBarClick = (data: any) => {
    if (data && data.id) {
      // Navegar al mapa filtrando por esta agencia
      router.push(`/?agency=${data.id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-white">
        <span className="text-[#e8734a]">Pulso</span> Transit
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Paradas totales" value={stats.totalStops} />
        <StatsCard label="Rutas totales" value={stats.totalRoutes} />
        <StatsCard label="Sistemas" value={stats.totalAgencies} />
        <StatsCard label="Rutas nocturnas" value={stats.nightRouteCount} color="#a78bfa" />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
        <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider">
          Rutas por Sistema (Haz clic para ver en el mapa)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={routesByAgencyData} 
            layout="vertical"
            onClick={(state: any) => {
              if (state && state.activePayload) {
                handleBarClick(state.activePayload[0].payload);
              }
            }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              width={150}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} className="cursor-pointer">
              {routesByAgencyData.map((entry, i) => (
                <Cell 
                  key={i} 
                  fill={entry.color} 
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
