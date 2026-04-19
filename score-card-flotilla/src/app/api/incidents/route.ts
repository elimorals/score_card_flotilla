import { NextResponse } from "next/server";

// Simular base de datos en memoria
export type Incident = {
  id: string;
  type: "retraso" | "accidente" | "mantenimiento" | "otro";
  description: string;
  route_id?: string;
  stop_id?: string;
  lat: number;
  lon: number;
  timestamp: string;
  votes: number;
};

// Incidentes por defecto para tener algo que mostrar
const globalIncidents: Incident[] = [
  {
    id: "1",
    type: "retraso",
    description: "Retraso importante por tráfico pesado en la zona.",
    route_id: "L1",
    lat: 19.4267,
    lon: -99.1489, // Balderas
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    votes: 12,
  },
  {
    id: "2",
    type: "mantenimiento",
    description: "Estación cerrada temporalmente por obras.",
    stop_id: "ZOCALO",
    lat: 19.4326,
    lon: -99.1332,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    votes: 5,
  }
];

export async function GET() {
  return NextResponse.json({ incidents: globalIncidents });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newIncident: Incident = {
      id: Math.random().toString(36).substring(7),
      type: body.type || "otro",
      description: body.description || "",
      route_id: body.route_id,
      stop_id: body.stop_id,
      lat: body.lat,
      lon: body.lon,
      timestamp: new Date().toISOString(),
      votes: 0,
    };
    
    globalIncidents.push(newIncident);
    
    return NextResponse.json({ success: true, incident: newIncident });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
