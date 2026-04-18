export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface NearbyStop {
  stop_id: string;
  stop_name: string;
  distance: number;
  routes: string[];
  agencies: string[];
  wheelchair_boarding: number;
  lat: number;
  lon: number;
}

export function findNearbyStops(
  lat: number,
  lon: number,
  stopsGeoJson: GeoJSON.FeatureCollection,
  radiusKm: number = 1
): NearbyStop[] {
  const results: NearbyStop[] = [];

  for (const feature of stopsGeoJson.features) {
    const [sLon, sLat] = feature.geometry.type === "Point"
      ? (feature.geometry as GeoJSON.Point).coordinates
      : [0, 0];
    const dist = haversineDistance(lat, lon, sLat, sLon);

    if (dist <= radiusKm) {
      const props = feature.properties as Record<string, unknown>;
      results.push({
        stop_id: props.stop_id as string,
        stop_name: props.stop_name as string,
        distance: Math.round(dist * 1000),
        routes: props.routes as string[],
        agencies: props.agencies as string[],
        wheelchair_boarding: props.wheelchair_boarding as number,
        lat: sLat,
        lon: sLon,
      });
    }
  }

  return results.sort((a, b) => a.distance - b.distance);
}

export function formatHeadway(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return "< 1 min";
  return `${minutes} min`;
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":");
  let hour = parseInt(h);
  if (hour >= 24) hour -= 24;
  return `${hour.toString().padStart(2, "0")}:${m}`;
}
