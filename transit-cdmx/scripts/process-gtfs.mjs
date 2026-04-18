import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const GTFS_DIR = join(process.cwd(), "gtfs");
const OUT_DIR = join(process.cwd(), "public", "data");

mkdirSync(OUT_DIR, { recursive: true });

// --- CSV Parser ---
function parseCSV(filename) {
  const raw = readFileSync(join(GTFS_DIR, filename), "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim());
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    // Handle quoted fields with commas
    const values = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj;
  });
}

console.log("Parsing GTFS files...");
const agencies = parseCSV("agency.txt");
const routes = parseCSV("routes.txt");
const trips = parseCSV("trips.txt");
const stops = parseCSV("stops.txt");
const stopTimes = parseCSV("stop_times.txt");
const shapes = parseCSV("shapes.txt");
const frequencies = parseCSV("frequencies.txt");

console.log(`  agencies: ${agencies.length}`);
console.log(`  routes: ${routes.length}`);
console.log(`  trips: ${trips.length}`);
console.log(`  stops: ${stops.length}`);
console.log(`  stop_times: ${stopTimes.length}`);
console.log(`  shapes: ${shapes.length}`);
console.log(`  frequencies: ${frequencies.length}`);

// --- 1. Build routes GeoJSON ---
console.log("\nBuilding routes GeoJSON...");

// Group shape points by shape_id
const shapesByShapeId = {};
for (const pt of shapes) {
  const sid = pt.shape_id;
  if (!shapesByShapeId[sid]) shapesByShapeId[sid] = [];
  shapesByShapeId[sid].push({
    lat: parseFloat(pt.shape_pt_lat),
    lon: parseFloat(pt.shape_pt_lon),
    seq: parseInt(pt.shape_pt_sequence),
  });
}

// Sort each shape by sequence
for (const sid of Object.keys(shapesByShapeId)) {
  shapesByShapeId[sid].sort((a, b) => a.seq - b.seq);
}

// Map trip shape_id to route_id (pick first trip per route with a shape)
const routeToShapeIds = {};
for (const trip of trips) {
  if (!trip.shape_id) continue;
  if (!routeToShapeIds[trip.route_id]) routeToShapeIds[trip.route_id] = new Set();
  routeToShapeIds[trip.route_id].add(trip.shape_id);
}

// Build route index
const routeIndex = {};
for (const r of routes) {
  routeIndex[r.route_id] = r;
}

// Create GeoJSON features - one per shape (captures both directions)
const routeFeatures = [];
for (const [routeId, shapeIds] of Object.entries(routeToShapeIds)) {
  const route = routeIndex[routeId];
  if (!route) continue;

  for (const shapeId of shapeIds) {
    const pts = shapesByShapeId[shapeId];
    if (!pts || pts.length < 2) continue;

    routeFeatures.push({
      type: "Feature",
      properties: {
        route_id: routeId,
        shape_id: shapeId,
        agency_id: route.agency_id,
        route_short_name: route.route_short_name,
        route_long_name: route.route_long_name,
        route_color: route.route_color || "888888",
        route_type: route.route_type,
      },
      geometry: {
        type: "LineString",
        coordinates: pts.map((p) => [p.lon, p.lat]),
      },
    });
  }
}

const routesGeo = {
  type: "FeatureCollection",
  features: routeFeatures,
};
writeFileSync(join(OUT_DIR, "routes-geo.json"), JSON.stringify(routesGeo));
console.log(`  routes-geo.json: ${routeFeatures.length} features`);

// --- 2. Build stops GeoJSON ---
console.log("Building stops GeoJSON...");

// Map stop_id to routes via stop_times -> trips -> routes
const stopToTrips = {};
for (const st of stopTimes) {
  if (!stopToTrips[st.stop_id]) stopToTrips[st.stop_id] = new Set();
  stopToTrips[st.stop_id].add(st.trip_id);
}

const tripToRoute = {};
for (const t of trips) {
  tripToRoute[t.trip_id] = t.route_id;
}

const stopFeatures = stops.map((s) => {
  const tripIds = stopToTrips[s.stop_id] || new Set();
  const routeIds = new Set();
  const agencyIds = new Set();

  for (const tid of tripIds) {
    const rid = tripToRoute[tid];
    if (rid && routeIndex[rid]) {
      routeIds.add(routeIndex[rid].route_short_name);
      agencyIds.add(routeIndex[rid].agency_id);
    }
  }

  return {
    type: "Feature",
    properties: {
      stop_id: s.stop_id,
      stop_name: s.stop_name,
      wheelchair_boarding: parseInt(s.wheelchair_boarding) || 0,
      routes: [...routeIds],
      agencies: [...agencyIds],
    },
    geometry: {
      type: "Point",
      coordinates: [parseFloat(s.stop_lon), parseFloat(s.stop_lat)],
    },
  };
});

const stopsGeo = {
  type: "FeatureCollection",
  features: stopFeatures,
};
writeFileSync(join(OUT_DIR, "stops-geo.json"), JSON.stringify(stopsGeo));
console.log(`  stops-geo.json: ${stopFeatures.length} features`);

// --- 3. Build frequencies index ---
console.log("Building frequencies index...");

const tripIndex = {};
for (const t of trips) {
  tripIndex[t.trip_id] = t;
}

const freqIndex = {};
for (const f of frequencies) {
  const trip = tripIndex[f.trip_id];
  if (!trip) continue;
  const rid = trip.route_id;

  if (!freqIndex[rid]) {
    const route = routeIndex[rid];
    freqIndex[rid] = {
      route_short_name: route?.route_short_name || "",
      route_long_name: route?.route_long_name || "",
      agency_id: route?.agency_id || "",
      frequencies: [],
    };
  }

  freqIndex[rid].frequencies.push({
    trip_id: f.trip_id,
    start_time: f.start_time,
    end_time: f.end_time,
    headway_secs: parseInt(f.headway_secs) || 0,
    direction_id: trip.direction_id || "",
    trip_headsign: trip.trip_headsign || "",
  });
}

writeFileSync(join(OUT_DIR, "frequencies-index.json"), JSON.stringify(freqIndex));
console.log(`  frequencies-index.json: ${Object.keys(freqIndex).length} routes`);

// --- 4. Build night routes ---
console.log("Building night routes...");

const nightTripIds = new Set();
for (const f of frequencies) {
  const startHour = parseInt(f.start_time.split(":")[0]);
  if (startHour >= 24) {
    nightTripIds.add(f.trip_id);
  }
}

const nightRouteIds = new Set();
for (const tid of nightTripIds) {
  const trip = tripIndex[tid];
  if (trip) nightRouteIds.add(trip.route_id);
}

const nightFeatures = routeFeatures.filter((f) =>
  nightRouteIds.has(f.properties.route_id)
);
const nightRoutesGeo = {
  type: "FeatureCollection",
  features: nightFeatures,
};
writeFileSync(join(OUT_DIR, "night-routes.json"), JSON.stringify(nightRoutesGeo));
console.log(`  night-routes.json: ${nightFeatures.length} features (${nightRouteIds.size} routes)`);

// --- 5. Build stats ---
console.log("Building stats...");

const accessibleCount = stops.filter((s) => parseInt(s.wheelchair_boarding) === 1).length;
const notAccessibleCount = stops.filter((s) => parseInt(s.wheelchair_boarding) === 2).length;
const unknownCount = stops.length - accessibleCount - notAccessibleCount;

// Routes by agency
const routesByAgency = {};
for (const r of routes) {
  routesByAgency[r.agency_id] = (routesByAgency[r.agency_id] || 0) + 1;
}

// Stops by agency (using stopFeatures which have agencies)
const stopsByAgency = {};
for (const sf of stopFeatures) {
  for (const aid of sf.properties.agencies) {
    stopsByAgency[aid] = (stopsByAgency[aid] || 0) + 1;
  }
}

// Avg frequency by agency
const agencyHeadways = {};
for (const [, data] of Object.entries(freqIndex)) {
  const aid = data.agency_id;
  if (!agencyHeadways[aid]) agencyHeadways[aid] = [];
  for (const f of data.frequencies) {
    if (f.headway_secs > 0) agencyHeadways[aid].push(f.headway_secs);
  }
}

const avgFreqByAgency = Object.entries(agencyHeadways).map(([agency, headways]) => ({
  agency,
  avgHeadway: Math.round(headways.reduce((a, b) => a + b, 0) / headways.length),
}));

const stats = {
  totalStops: stops.length,
  totalRoutes: routes.length,
  totalAgencies: agencies.length,
  accessibleStops: accessibleCount,
  notAccessibleStops: notAccessibleCount,
  unknownAccessibilityStops: unknownCount,
  routesByAgency: Object.entries(routesByAgency)
    .map(([agency, count]) => ({ agency, count }))
    .sort((a, b) => b.count - a.count),
  stopsByAgency: Object.entries(stopsByAgency)
    .map(([agency, count]) => ({ agency, count }))
    .sort((a, b) => b.count - a.count),
  avgFrequencyByAgency: avgFreqByAgency.sort((a, b) => a.avgHeadway - b.avgHeadway),
  nightRouteCount: nightRouteIds.size,
};

writeFileSync(join(OUT_DIR, "stats.json"), JSON.stringify(stats, null, 2));
console.log(`  stats.json written`);

console.log("\nDone! All files written to public/data/");
