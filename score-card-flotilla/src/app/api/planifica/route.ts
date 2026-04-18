import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { readFileSync } from "fs";
import { join } from "path";
import type { StopFeatureProperties } from "@/lib/types";

// Load stops data at startup
let stopsData: GeoJSON.FeatureCollection | null = null;
let freqData: Record<string, unknown> | null = null;

function loadData() {
  if (!stopsData) {
    try {
      const stopsRaw = readFileSync(
        join(process.cwd(), "public", "data", "stops-geo.json"),
        "utf-8"
      );
      stopsData = JSON.parse(stopsRaw);
      const freqRaw = readFileSync(
        join(process.cwd(), "public", "data", "frequencies-index.json"),
        "utf-8"
      );
      freqData = JSON.parse(freqRaw);
    } catch {
      console.error("Failed to load GTFS data");
    }
  }
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearbyStopsContext(lat: number, lon: number, radiusKm = 1): string {
  if (!stopsData) return "No hay datos de paradas disponibles.";

  const nearby = stopsData.features
    .map((f) => {
      const [sLon, sLat] = (f.geometry as GeoJSON.Point).coordinates;
      const dist = haversine(lat, lon, sLat, sLon);
      const props = f.properties as StopFeatureProperties;
      return { ...props, dist, lat: sLat, lon: sLon };
    })
    .filter((s) => s.dist <= radiusKm)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 15);

  return nearby
    .map(
      (s) =>
        `- ${s.stop_name} (${Math.round(s.dist * 1000)}m) | Rutas: ${(s.routes as string[]).join(", ")} | Accesible: ${s.wheelchair_boarding === 1 ? "Si" : s.wheelchair_boarding === 2 ? "No" : "Sin info"}`
    )
    .join("\n");
}

export async function POST(request: Request) {
  loadData();
  const { messages } = await request.json();

  // Known CDMX landmarks for context
  const landmarks: Record<string, [number, number]> = {
    zocalo: [19.4326, -99.1332],
    "centro historico": [19.4326, -99.1332],
    chapultepec: [19.4204, -99.1894],
    coyoacan: [19.3505, -99.1614],
    polanco: [19.4334, -99.1954],
    condesa: [19.4117, -99.1748],
    roma: [19.4168, -99.1614],
    "santa fe": [19.3573, -99.2621],
    aeropuerto: [19.4361, -99.0719],
    cu: [19.3325, -99.1872],
    "ciudad universitaria": [19.3325, -99.1872],
    xochimilco: [19.2534, -99.1013],
    tacubaya: [19.4022, -99.1875],
    indios_verdes: [19.4964, -99.1197],
    "indios verdes": [19.4964, -99.1197],
    tasquena: [19.3444, -99.1407],
    pantitlan: [19.4155, -99.0725],
    observatorio: [19.3985, -99.1989],
    buenavista: [19.4467, -99.1527],
    balderas: [19.4267, -99.1489],
    tepito: [19.4426, -99.1248],
    tlalpan: [19.2947, -99.1562],
    iztapalapa: [19.3557, -99.0581],
    "milpa alta": [19.1928, -99.0234],
  };

  // Build system context with nearby stops for known places mentioned
  let contextInfo =
    "Eres un asistente de movilidad de la Ciudad de Mexico. Ayudas a planificar rutas de transporte publico.\n\n";
  contextInfo += "SISTEMAS DISPONIBLES:\n";
  contextInfo +=
    "- METRO: 12 lineas, frecuencia ~3 min\n";
  contextInfo +=
    "- METROBUS: 7 lineas de BRT, frecuencia ~5 min\n";
  contextInfo += "- RTP: Red de Transporte de Pasajeros, autobuses\n";
  contextInfo += "- TROLEBUS: Trolebuses electricos\n";
  contextInfo += "- CABLEBUS: 3 lineas de teleferico\n";
  contextInfo += "- TREN LIGERO: Tasquena - Xochimilco\n";
  contextInfo += "- SUBURBANO: Buenavista - Cuautitlan\n";
  contextInfo += "- PUMABUS: Transporte gratuito en CU\n";
  contextInfo += "- CORREDORES CONCESIONADOS: Autobuses concesionados\n\n";

  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

  for (const [name, coords] of Object.entries(landmarks)) {
    if (lastMessage.includes(name)) {
      contextInfo += `\nParadas cerca de "${name}" (${coords[0]}, ${coords[1]}):\n`;
      contextInfo += getNearbyStopsContext(coords[0], coords[1]);
    }
  }

  if (freqData) {
    contextInfo += "\n\nFRECUENCIAS DESTACADAS:\n";
    const entries = Object.entries(freqData).slice(0, 20);
    for (const [, data] of entries) {
      const d = data as { route_short_name: string; agency_id: string; frequencies: Array<{ headway_secs: number; start_time: string; end_time: string }> };
      if (d.frequencies.length > 0) {
        const f = d.frequencies[0];
        contextInfo += `- Ruta ${d.route_short_name} (${d.agency_id}): cada ${Math.round(f.headway_secs / 60)} min, ${f.start_time}-${f.end_time}\n`;
      }
    }
  }

  contextInfo +=
    "\n\nINSTRUCCIONES:\n";
  contextInfo +=
    "- Sugiere rutas usando los sistemas de transporte publico disponibles\n";
  contextInfo += "- Indica transbordos necesarios y estaciones de conexion\n";
  contextInfo +=
    "- Si el usuario necesita accesibilidad, priorizala\n";
  contextInfo += "- Da tiempos estimados basados en las frecuencias\n";
  contextInfo +=
    "- Responde siempre en espanol, de forma concisa y util\n";
  contextInfo +=
    "- Si no conoces la ubicacion exacta, pide que el usuario sea mas especifico\n";

  const result = streamText({
    model: anthropic("claude-3-5-sonnet-latest"),
    system: contextInfo,
    messages,
  });

  return result.toTextStreamResponse();
}
