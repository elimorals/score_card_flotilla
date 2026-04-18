export const CDMX_CENTER: [number, number] = [19.4326, -99.1332];
export const DEFAULT_ZOOM = 11;

export const AGENCY_COLORS: Record<string, string> = {
  METRO: "#F94F8E",
  MB: "#D40D0D",
  CC: "#9B26B6",
  RTP: "#E20613",
  TROLE: "#1F5AF0",
  TL: "#1F5AF0",
  SUB: "#FF0000",
  CBB: "#4EC3E0",
  PUMABUS: "#C2D83F",
  INTERURBANO: "#83332E",
  SEMOVI: "#009B3A",
};

export const AGENCY_NAMES: Record<string, string> = {
  METRO: "Metro",
  MB: "Metrobus",
  CC: "Corredores Concesionados",
  RTP: "RTP",
  TROLE: "Trolebus",
  TL: "Tren Ligero",
  SUB: "Suburbano",
  CBB: "Cablebus",
  PUMABUS: "Pumabus",
  INTERURBANO: "Tren El Insurgente",
  SEMOVI: "SEMOVI",
};

export const WHEELCHAIR_COLORS: Record<number, string> = {
  0: "#6b7280", // gray - unknown
  1: "#22c55e", // green - accessible
  2: "#ef4444", // red - not accessible
};

export const WHEELCHAIR_LABELS: Record<number, string> = {
  0: "Sin informacion",
  1: "Accesible",
  2: "No accesible",
};
