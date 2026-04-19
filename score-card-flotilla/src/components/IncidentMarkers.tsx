"use client";

import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import type { Incident } from "@/app/api/incidents/route";
import L from "leaflet";

// Create custom icon for incidents
const incidentIconHtml = `
  <div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
    <span style="color: white; font-size: 14px; font-weight: bold;">!</span>
  </div>
`;

export default function IncidentMarkers() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [icon, setIcon] = useState<L.DivIcon | null>(null);

  useEffect(() => {
    // Only create icon on client side
    setIcon(
      L.divIcon({
        html: incidentIconHtml,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      })
    );

    // Fetch incidents periodically
    const fetchIncidents = () => {
      fetch("/api/incidents")
        .then((res) => res.json())
        .then((data) => {
          if (data.incidents) setIncidents(data.incidents);
        })
        .catch(console.error);
    };

    fetchIncidents();
    const interval = setInterval(fetchIncidents, 30000); // 30s polling

    return () => clearInterval(interval);
  }, []);

  if (!icon || incidents.length === 0) return null;

  return (
    <>
      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.lat, incident.lon]}
          icon={icon}
        >
          <Popup>
            <div className="min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-base text-red-400 capitalize">
                  {incident.type}
                </h3>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">
                  👍 {incident.votes}
                </span>
              </div>
              <p className="text-sm text-gray-200 mb-2">{incident.description}</p>
              <div className="text-xs text-gray-400">
                {new Date(incident.timestamp).toLocaleString("es-MX")}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
