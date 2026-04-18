"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    fetch("/data/stats.json")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Cargando dashboard...</div>
      </div>
    );
  }

  const routesByAgencyData = stats.routesByAgency.map((d) => ({
    name: AGENCY_NAMES[d.agency] || d.agency,
    value: d.count,
    color: AGENCY_COLORS[d.agency] || "#888",
  }));

  const stopsByAgencyData = stats.stopsByAgency.map((d) => ({
    name: AGENCY_NAMES[d.agency] || d.agency,
    value: d.count,
    color: AGENCY_COLORS[d.agency] || "#888",
  }));

  const freqData = stats.avgFrequencyByAgency.map((d) => ({
    name: AGENCY_NAMES[d.agency] || d.agency,
    value: Math.round(d.avgHeadway / 60),
    color: AGENCY_COLORS[d.agency] || "#888",
  }));

  const accessPieData = [
    { name: "Accesible", value: stats.accessibleStops, fill: "#22c55e" },
    { name: "No accesible", value: stats.notAccessibleStops, fill: "#ef4444" },
    { name: "Sin info", value: stats.unknownAccessibilityStops, fill: "#6b7280" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">
        <span className="text-[#e8734a]">Pulso</span> Transit
      </h1>
      <p className="text-gray-400 text-sm mb-6">
        Estadisticas del sistema de transporte publico de la CDMX
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Paradas totales" value={stats.totalStops} />
        <StatsCard label="Rutas totales" value={stats.totalRoutes} />
        <StatsCard label="Sistemas" value={stats.totalAgencies} />
        <StatsCard
          label="Rutas nocturnas"
          value={stats.nightRouteCount}
          color="#a78bfa"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Routes by Agency */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 className="text-sm font-bold text-gray-400 mb-4">RUTAS POR SISTEMA</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={routesByAgencyData} layout="vertical">
              <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#ededed",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {routesByAgencyData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stops by Agency */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 className="text-sm font-bold text-gray-400 mb-4">
            PARADAS POR SISTEMA
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stopsByAgencyData} layout="vertical">
              <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#ededed",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {stopsByAgencyData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Avg Frequency */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 className="text-sm font-bold text-gray-400 mb-4">
            FRECUENCIA PROMEDIO (MIN)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={freqData} layout="vertical">
              <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#ededed",
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${value} min`, "Frecuencia"]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {freqData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accessibility Pie */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 className="text-sm font-bold text-gray-400 mb-4">
            ACCESIBILIDAD EN SILLA DE RUEDAS
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={accessPieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {accessPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#ededed",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
