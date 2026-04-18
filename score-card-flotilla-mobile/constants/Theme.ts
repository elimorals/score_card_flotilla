export const CDMX_CENTER = {
  latitude: 19.4326,
  longitude: -99.1332,
};

export const THEME = {
  background: "#0a0a0a",
  foreground: "#ededed",
  accent: "#e8734a",
  accentLight: "#f4a261",
  card: "#1e1e2e",
  border: "rgba(255,255,255,0.1)",
};

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
  MB: "Metrobús",
  CC: "Corredores",
  RTP: "RTP",
  TROLE: "Trolebús",
  TL: "Tren Ligero",
  SUB: "Suburbano",
  CBB: "Cablebús",
  PUMABUS: "Pumabús",
  INTERURBANO: "Tren Insurgente",
  SEMOVI: "SEMOVI",
};

export const WHEELCHAIR_COLORS: Record<number, string> = {
  0: "#6b7280", // gray - unknown
  1: "#22c55e", // green - accessible
  2: "#ef4444", // red - not accessible
};
