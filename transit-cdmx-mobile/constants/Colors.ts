const tintColorLight = '#e8734a';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#0a0a0a',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

// Agregamos nuestras constantes de transporte aquí también para que sean accesibles
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

export const WHEELCHAIR_COLORS: Record<number, string> = {
  0: "#6b7280",
  1: "#22c55e",
  2: "#ef4444",
};
export { useColorScheme } from '@/components/useColorScheme';
