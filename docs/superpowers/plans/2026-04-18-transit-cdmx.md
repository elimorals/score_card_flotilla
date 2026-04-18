# Transit CDMX - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a unified web app that visualizes CDMX public transit data (GTFS) across 4 views: interactive map, AI route planner, accessibility map, frequency dashboard, and night transit guide.

**Architecture:** Next.js 15 App Router with static JSON data pre-processed from GTFS CSVs. Leaflet maps render GeoJSON layers. Claude API powers the route planner via Vercel AI SDK. All data is static (no database).

**Tech Stack:** Next.js 15, react-leaflet, Leaflet, Recharts, Tailwind CSS, Vercel AI SDK, Anthropic Claude API

**Source data:** `gtfs/` directory with 8 CSV files (agency, routes, trips, calendar, frequencies, shapes, stops, stop_times)

---

## File Structure

```
transit-cdmx/
├── scripts/
│   └── process-gtfs.mjs          # GTFS CSV -> JSON/GeoJSON processor
├── public/data/                   # Generated static data (gitignored)
│   ├── routes-geo.json            # GeoJSON FeatureCollection of route shapes
│   ├── stops-geo.json             # GeoJSON FeatureCollection of stops
│   ├── frequencies-index.json     # Frequencies indexed by route_id
│   ├── night-routes.json          # GeoJSON of nocturnal routes only
│   └── stats.json                 # Pre-computed statistics for dashboard
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with NavBar + dark theme
│   │   ├── page.tsx               # Landing: full-screen map with all routes
│   │   ├── planifica/
│   │   │   └── page.tsx           # AI route planner with chat + map
│   │   ├── accesibilidad/
│   │   │   └── page.tsx           # Accessibility map view
│   │   ├── pulso/
│   │   │   └── page.tsx           # Statistics dashboard
│   │   ├── nocturno/
│   │   │   └── page.tsx           # Night transit map
│   │   └── api/
│   │       └── planifica/
│   │           └── route.ts       # Claude API endpoint for route planning
│   ├── components/
│   │   ├── NavBar.tsx             # Top navigation bar
│   │   ├── TransitMap.tsx         # Reusable Leaflet map (client-only)
│   │   ├── RouteLayer.tsx         # GeoJSON layer for a set of routes
│   │   ├── StopMarkers.tsx        # Clustered stop markers
│   │   ├── StopPopup.tsx          # Popup content for a stop
│   │   ├── ChatPanel.tsx          # Chat interface for planifica
│   │   ├── StatsCard.tsx          # Stat card for dashboard
│   │   └── AgencyLegend.tsx       # Color legend for agencies
│   ├── lib/
│   │   ├── constants.ts           # Agency colors, map defaults
│   │   ├── types.ts               # TypeScript interfaces for GTFS data
│   │   └── geo-utils.ts           # Haversine distance, nearest stops
│   └── styles/
│       └── globals.css            # Tailwind + Leaflet CSS fixes
├── gtfs/                          # Raw GTFS data (already exists at ../gtfs)
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Task 1: Scaffold Next.js project and install dependencies

**Files:**
- Create: `transit-cdmx/package.json`
- Create: `transit-cdmx/next.config.ts`
- Create: `transit-cdmx/tailwind.config.ts`
- Create: `transit-cdmx/tsconfig.json`
- Create: `transit-cdmx/src/styles/globals.css`

- [ ] **Step 1: Create Next.js app**

```bash
cd /Users/elias/Documents/Trabajo/180426
npx create-next-app@latest transit-cdmx --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm
```

Accept all defaults. This creates the base project.

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/elias/Documents/Trabajo/180426/transit-cdmx
npm install leaflet react-leaflet recharts ai @ai-sdk/anthropic
npm install -D @types/leaflet csv-parse
```

- [ ] **Step 3: Update `src/styles/globals.css`** to include Leaflet CSS and dark theme base

Replace content of `src/app/globals.css` with:

```css
@import "tailwindcss";
@import "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

:root {
  --background: #0a0a0a;
  --foreground: #ededed;
  --accent: #e8734a;
  --accent-light: #f4a261;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: system-ui, -apple-system, sans-serif;
}

.leaflet-container {
  background: #1a1a2e !important;
}

.leaflet-popup-content-wrapper {
  background: #1e1e2e !important;
  color: #ededed !important;
  border-radius: 8px !important;
}

.leaflet-popup-tip {
  background: #1e1e2e !important;
}
```

- [ ] **Step 4: Update `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

- [ ] **Step 5: Copy GTFS data into project**

```bash
cp -r /Users/elias/Documents/Trabajo/180426/gtfs /Users/elias/Documents/Trabajo/180426/transit-cdmx/gtfs
mkdir -p /Users/elias/Documents/Trabajo/180426/transit-cdmx/public/data
```

- [ ] **Step 6: Initialize git and commit**

```bash
cd /Users/elias/Documents/Trabajo/180426/transit-cdmx
git init
echo "public/data/*.json" >> .gitignore
echo "node_modules" >> .gitignore
git add -A
git commit -m "feat: scaffold Next.js project with dependencies"
```

---

## Task 2: Define TypeScript types and constants

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/constants.ts`

- [ ] **Step 1: Create `src/lib/types.ts`**

```ts
export interface GtfsAgency {
  agency_id: string;
  agency_name: string;
  agency_url: string;
}

export interface GtfsRoute {
  route_id: string;
  agency_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type: string;
  route_color: string;
}

export interface GtfsStop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  wheelchair_boarding: number;
}

export interface GtfsTrip {
  route_id: string;
  service_id: string;
  trip_id: string;
  shape_id: string;
  trip_headsign: string;
  direction_id: string;
}

export interface GtfsFrequency {
  trip_id: string;
  start_time: string;
  end_time: string;
  headway_secs: number;
}

export interface GtfsStopTime {
  trip_id: string;
  stop_id: string;
  stop_sequence: number;
  arrival_time: string;
  departure_time: string;
}

export interface GtfsShape {
  shape_id: string;
  shape_pt_lat: number;
  shape_pt_lon: number;
  shape_pt_sequence: number;
}

// Processed types for the app
export interface RouteFeatureProperties {
  route_id: string;
  agency_id: string;
  route_short_name: string;
  route_long_name: string;
  route_color: string;
  route_type: string;
}

export interface StopFeatureProperties {
  stop_id: string;
  stop_name: string;
  wheelchair_boarding: number;
  routes: string[]; // route_short_names that stop here
  agencies: string[]; // agency_ids that serve this stop
}

export interface FrequencyEntry {
  trip_id: string;
  start_time: string;
  end_time: string;
  headway_secs: number;
  direction_id: string;
  trip_headsign: string;
}

export interface FrequencyIndex {
  [route_id: string]: {
    route_short_name: string;
    route_long_name: string;
    agency_id: string;
    frequencies: FrequencyEntry[];
  };
}

export interface TransitStats {
  totalStops: number;
  totalRoutes: number;
  totalAgencies: number;
  accessibleStops: number;
  notAccessibleStops: number;
  unknownAccessibilityStops: number;
  routesByAgency: { agency: string; count: number }[];
  stopsByAgency: { agency: string; count: number }[];
  avgFrequencyByAgency: { agency: string; avgHeadway: number }[];
  nightRouteCount: number;
}
```

- [ ] **Step 2: Create `src/lib/constants.ts`**

```ts
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
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/constants.ts
git commit -m "feat: add TypeScript types and constants for GTFS data"
```

---

## Task 3: Build GTFS data processing script

**Files:**
- Create: `scripts/process-gtfs.mjs`

This is the most critical task. It converts raw CSV files into optimized JSON for the frontend.

- [ ] **Step 1: Create `scripts/process-gtfs.mjs`**

```js
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
for (const [rid, data] of Object.entries(freqIndex)) {
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
```

- [ ] **Step 2: Run the script**

```bash
cd /Users/elias/Documents/Trabajo/180426/transit-cdmx
node scripts/process-gtfs.mjs
```

Expected output: all 5 JSON files created in `public/data/`.

- [ ] **Step 3: Verify output**

```bash
ls -lh public/data/
```

Should see: `routes-geo.json`, `stops-geo.json`, `frequencies-index.json`, `night-routes.json`, `stats.json`

- [ ] **Step 4: Commit**

```bash
git add scripts/process-gtfs.mjs .gitignore
git commit -m "feat: add GTFS data processing script"
```

---

## Task 4: Create layout, NavBar, and geo-utils

**Files:**
- Create: `src/lib/geo-utils.ts`
- Create: `src/components/NavBar.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create `src/lib/geo-utils.ts`**

```ts
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
```

- [ ] **Step 2: Create `src/components/NavBar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Mapa", icon: "🗺" },
  { href: "/planifica", label: "Planifica", icon: "🧭" },
  { href: "/accesibilidad", label: "Accesibilidad", icon: "♿" },
  { href: "/pulso", label: "Pulso", icon: "📊" },
  { href: "/nocturno", label: "Nocturno", icon: "🌙" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-[#0a0a0a]/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="text-lg font-bold">
          <span className="text-[#e8734a]">Transit</span>{" "}
          <span className="text-white">CDMX</span>
        </Link>
        <div className="flex gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === item.href
                  ? "bg-[#e8734a] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Update `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Transit CDMX - Movilidad Inteligente",
  description:
    "Visualiza, planifica y explora el transporte publico de la Ciudad de Mexico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <NavBar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/geo-utils.ts src/components/NavBar.tsx src/app/layout.tsx
git commit -m "feat: add layout, NavBar, and geo utilities"
```

---

## Task 5: Build TransitMap, RouteLayer, and StopPopup components

**Files:**
- Create: `src/components/TransitMap.tsx`
- Create: `src/components/RouteLayer.tsx`
- Create: `src/components/StopMarkers.tsx`
- Create: `src/components/StopPopup.tsx`
- Create: `src/components/AgencyLegend.tsx`

- [ ] **Step 1: Create `src/components/TransitMap.tsx`**

```tsx
"use client";

import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { CDMX_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import "leaflet/dist/leaflet.css";

interface TransitMapProps {
  children?: React.ReactNode;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function TransitMap({
  children,
  center = CDMX_CENTER,
  zoom = DEFAULT_ZOOM,
  className = "h-[calc(100vh-3.5rem)] w-full",
}: TransitMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      className={className}
      style={{ background: "#1a1a2e" }}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {children}
    </MapContainer>
  );
}
```

- [ ] **Step 2: Create `src/components/RouteLayer.tsx`**

```tsx
"use client";

import { GeoJSON } from "react-leaflet";
import type { Feature, LineString } from "geojson";
import type { PathOptions } from "leaflet";
import type { RouteFeatureProperties } from "@/lib/types";

interface RouteLayerProps {
  data: GeoJSON.FeatureCollection;
  opacity?: number;
  weight?: number;
  filterAgency?: string | null;
  onRouteClick?: (properties: RouteFeatureProperties) => void;
}

export default function RouteLayer({
  data,
  opacity = 0.8,
  weight = 2.5,
  filterAgency = null,
  onRouteClick,
}: RouteLayerProps) {
  const filteredData: GeoJSON.FeatureCollection = filterAgency
    ? {
        type: "FeatureCollection",
        features: data.features.filter(
          (f) => f.properties?.agency_id === filterAgency
        ),
      }
    : data;

  return (
    <GeoJSON
      key={filterAgency || "all"}
      data={filteredData}
      style={(feature?: Feature<LineString, RouteFeatureProperties>) => {
        const color = feature?.properties?.route_color
          ? `#${feature.properties.route_color}`
          : "#888888";
        return {
          color,
          weight,
          opacity,
          lineJoin: "round",
          lineCap: "round",
        } as PathOptions;
      }}
      onEachFeature={(feature, layer) => {
        const p = feature.properties as RouteFeatureProperties;
        layer.bindPopup(
          `<div>
            <strong class="text-base">${p.route_short_name}</strong>
            <div class="text-sm text-gray-300 mt-1">${p.route_long_name}</div>
            <div class="text-xs text-gray-400 mt-1">${p.agency_id}</div>
          </div>`
        );
        if (onRouteClick) {
          layer.on("click", () => onRouteClick(p));
        }
      }}
    />
  );
}
```

- [ ] **Step 3: Create `src/components/StopPopup.tsx`**

```tsx
import { WHEELCHAIR_LABELS, WHEELCHAIR_COLORS } from "@/lib/constants";
import type { StopFeatureProperties } from "@/lib/types";

interface StopPopupProps {
  properties: StopFeatureProperties;
}

export default function StopPopup({ properties: p }: StopPopupProps) {
  const accessColor = WHEELCHAIR_COLORS[p.wheelchair_boarding] || "#6b7280";
  const accessLabel = WHEELCHAIR_LABELS[p.wheelchair_boarding] || "Desconocido";

  return (
    <div className="min-w-[200px]">
      <h3 className="font-bold text-base">{p.stop_name}</h3>
      <div
        className="text-xs mt-1 px-2 py-0.5 rounded inline-block"
        style={{ backgroundColor: accessColor + "33", color: accessColor }}
      >
        {accessLabel}
      </div>
      {p.routes.length > 0 && (
        <div className="mt-2 text-xs text-gray-300">
          <strong>Rutas:</strong> {p.routes.slice(0, 8).join(", ")}
          {p.routes.length > 8 && ` +${p.routes.length - 8} mas`}
        </div>
      )}
      {p.agencies.length > 0 && (
        <div className="mt-1 text-xs text-gray-400">
          {p.agencies.join(", ")}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/StopMarkers.tsx`**

```tsx
"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { WHEELCHAIR_COLORS } from "@/lib/constants";
import StopPopup from "./StopPopup";
import type { StopFeatureProperties } from "@/lib/types";

interface StopMarkersProps {
  data: GeoJSON.FeatureCollection;
  filterAgency?: string | null;
  filterAccessibility?: number | null;
  maxZoomToShow?: number;
}

export default function StopMarkers({
  data,
  filterAgency = null,
  filterAccessibility = null,
}: StopMarkersProps) {
  const filtered = data.features.filter((f) => {
    const p = f.properties as StopFeatureProperties;
    if (filterAgency && !p.agencies.includes(filterAgency)) return false;
    if (filterAccessibility !== null && p.wheelchair_boarding !== filterAccessibility)
      return false;
    return true;
  });

  return (
    <>
      {filtered.map((feature) => {
        const p = feature.properties as StopFeatureProperties;
        const [lon, lat] = (feature.geometry as GeoJSON.Point).coordinates;
        const color = WHEELCHAIR_COLORS[p.wheelchair_boarding] || "#6b7280";

        return (
          <CircleMarker
            key={p.stop_id}
            center={[lat, lon]}
            radius={4}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.7,
              weight: 1,
            }}
          >
            <Popup>
              <StopPopup properties={p} />
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
```

- [ ] **Step 5: Create `src/components/AgencyLegend.tsx`**

```tsx
"use client";

import { AGENCY_COLORS, AGENCY_NAMES } from "@/lib/constants";

interface AgencyLegendProps {
  agencies: string[];
  selectedAgency: string | null;
  onSelectAgency: (agency: string | null) => void;
}

export default function AgencyLegend({
  agencies,
  selectedAgency,
  onSelectAgency,
}: AgencyLegendProps) {
  return (
    <div className="absolute top-4 left-4 z-[500] bg-[#0a0a0a]/90 backdrop-blur rounded-lg p-3 max-h-[60vh] overflow-y-auto">
      <h3 className="text-sm font-bold text-[#e8734a] mb-2">Sistemas</h3>
      <button
        onClick={() => onSelectAgency(null)}
        className={`w-full text-left text-xs px-2 py-1 rounded mb-1 transition-colors ${
          selectedAgency === null
            ? "bg-[#e8734a] text-white"
            : "text-gray-400 hover:text-white hover:bg-white/10"
        }`}
      >
        Todos
      </button>
      {agencies.map((aid) => (
        <button
          key={aid}
          onClick={() => onSelectAgency(aid === selectedAgency ? null : aid)}
          className={`w-full text-left text-xs px-2 py-1 rounded mb-0.5 flex items-center gap-2 transition-colors ${
            selectedAgency === aid
              ? "bg-white/20 text-white"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <span
            className="w-3 h-3 rounded-full inline-block flex-shrink-0"
            style={{ backgroundColor: AGENCY_COLORS[aid] || "#888" }}
          />
          {AGENCY_NAMES[aid] || aid}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/
git commit -m "feat: add map components (TransitMap, RouteLayer, StopMarkers, Popups, Legend)"
```

---

## Task 6: Build Landing Page (Mapa General `/`)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AgencyLegend from "@/components/AgencyLegend";

const TransitMap = dynamic(() => import("@/components/TransitMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-3.5rem)] w-full bg-[#1a1a2e] flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">Cargando mapa...</div>
    </div>
  ),
});
const RouteLayer = dynamic(() => import("@/components/RouteLayer"), { ssr: false });
const StopMarkers = dynamic(() => import("@/components/StopMarkers"), { ssr: false });

export default function HomePage() {
  const [routesGeo, setRoutesGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [stopsGeo, setStopsGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/data/routes-geo.json").then((r) => r.json()),
      fetch("/data/stops-geo.json").then((r) => r.json()),
    ]).then(([routes, stops]) => {
      setRoutesGeo(routes);
      setStopsGeo(stops);
      const uniqueAgencies = [
        ...new Set(
          routes.features.map(
            (f: GeoJSON.Feature) => f.properties?.agency_id as string
          )
        ),
      ];
      setAgencies(uniqueAgencies.sort());
    });
  }, []);

  if (!routesGeo || !stopsGeo) {
    return (
      <div className="h-[calc(100vh-3.5rem)] w-full bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-gray-400 animate-pulse text-lg">
          Cargando Transit CDMX...
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AgencyLegend
        agencies={agencies}
        selectedAgency={selectedAgency}
        onSelectAgency={setSelectedAgency}
      />
      <TransitMap>
        <RouteLayer data={routesGeo} filterAgency={selectedAgency} />
        {selectedAgency && (
          <StopMarkers data={stopsGeo} filterAgency={selectedAgency} />
        )}
      </TransitMap>
    </div>
  );
}
```

- [ ] **Step 2: Run dev server and verify**

```bash
cd /Users/elias/Documents/Trabajo/180426/transit-cdmx
npm run dev
```

Open http://localhost:3000 - should see dark map with colored transit routes and agency filter.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add landing page with interactive transit map"
```

---

## Task 7: Build Accessibility Page (`/accesibilidad`)

**Files:**
- Create: `src/app/accesibilidad/page.tsx`

- [ ] **Step 1: Create `src/app/accesibilidad/page.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { WHEELCHAIR_COLORS, WHEELCHAIR_LABELS } from "@/lib/constants";
import type { TransitStats } from "@/lib/types";

const TransitMap = dynamic(() => import("@/components/TransitMap"), { ssr: false });
const RouteLayer = dynamic(() => import("@/components/RouteLayer"), { ssr: false });
const StopMarkers = dynamic(() => import("@/components/StopMarkers"), { ssr: false });

export default function AccesibilidadPage() {
  const [routesGeo, setRoutesGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [stopsGeo, setStopsGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [stats, setStats] = useState<TransitStats | null>(null);
  const [filter, setFilter] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/data/routes-geo.json").then((r) => r.json()),
      fetch("/data/stops-geo.json").then((r) => r.json()),
      fetch("/data/stats.json").then((r) => r.json()),
    ]).then(([routes, stops, statsData]) => {
      setRoutesGeo(routes);
      setStopsGeo(stops);
      setStats(statsData);
    });
  }, []);

  if (!routesGeo || !stopsGeo || !stats) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Cargando datos de accesibilidad...</div>
      </div>
    );
  }

  const accessPercent = ((stats.accessibleStops / stats.totalStops) * 100).toFixed(1);
  const notAccessPercent = ((stats.notAccessibleStops / stats.totalStops) * 100).toFixed(1);
  const unknownPercent = ((stats.unknownAccessibilityStops / stats.totalStops) * 100).toFixed(1);

  return (
    <div className="relative">
      {/* Info Panel */}
      <div className="absolute top-4 left-4 z-[500] bg-[#0a0a0a]/90 backdrop-blur rounded-lg p-4 w-72">
        <h2 className="text-lg font-bold text-[#e8734a] mb-3">
          ♿ Accesibilidad
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          Accesibilidad para silla de ruedas en {stats.totalStops.toLocaleString()} paradas de transporte publico.
        </p>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: WHEELCHAIR_COLORS[1] }} />
              Accesibles
            </span>
            <span className="text-green-400 font-mono">{stats.accessibleStops.toLocaleString()} ({accessPercent}%)</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: WHEELCHAIR_COLORS[2] }} />
              No accesibles
            </span>
            <span className="text-red-400 font-mono">{stats.notAccessibleStops.toLocaleString()} ({notAccessPercent}%)</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: WHEELCHAIR_COLORS[0] }} />
              Sin informacion
            </span>
            <span className="text-gray-400 font-mono">{stats.unknownAccessibilityStops.toLocaleString()} ({unknownPercent}%)</span>
          </div>
        </div>

        {/* Filters */}
        <div className="border-t border-white/10 pt-3">
          <h3 className="text-xs font-bold text-gray-500 mb-2">FILTRAR</h3>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilter(null)}
              className={`text-xs px-2 py-1 rounded ${
                filter === null ? "bg-[#e8734a] text-white" : "bg-white/10 text-gray-400"
              }`}
            >
              Todas
            </button>
            {[1, 2, 0].map((val) => (
              <button
                key={val}
                onClick={() => setFilter(filter === val ? null : val)}
                className={`text-xs px-2 py-1 rounded ${
                  filter === val ? "bg-[#e8734a] text-white" : "bg-white/10 text-gray-400"
                }`}
              >
                {WHEELCHAIR_LABELS[val]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <TransitMap>
        <RouteLayer data={routesGeo} opacity={0.3} weight={1.5} />
        <StopMarkers data={stopsGeo} filterAccessibility={filter} />
      </TransitMap>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/accesibilidad/
git commit -m "feat: add accessibility map page with wheelchair filters"
```

---

## Task 8: Build Dashboard Page (`/pulso`)

**Files:**
- Create: `src/components/StatsCard.tsx`
- Create: `src/app/pulso/page.tsx`

- [ ] **Step 1: Create `src/components/StatsCard.tsx`**

```tsx
interface StatsCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}

export default function StatsCard({
  label,
  value,
  sublabel,
  color = "#e8734a",
}: StatsCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-3xl font-bold mt-1" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/pulso/page.tsx`**

```tsx
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
                formatter={(value: number) => [`${value} min`, "Frecuencia"]}
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
                  `${name} ${(percent * 100).toFixed(0)}%`
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/StatsCard.tsx src/app/pulso/
git commit -m "feat: add Pulso dashboard with charts and statistics"
```

---

## Task 9: Build Night Transit Page (`/nocturno`)

**Files:**
- Create: `src/app/nocturno/page.tsx`

- [ ] **Step 1: Create `src/app/nocturno/page.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { FrequencyIndex } from "@/lib/types";
import { formatTime, formatHeadway } from "@/lib/geo-utils";
import { AGENCY_NAMES } from "@/lib/constants";

const TransitMap = dynamic(() => import("@/components/TransitMap"), { ssr: false });
const RouteLayer = dynamic(() => import("@/components/RouteLayer"), { ssr: false });
const StopMarkers = dynamic(() => import("@/components/StopMarkers"), { ssr: false });

export default function NocturnoPage() {
  const [nightGeo, setNightGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [stopsGeo, setStopsGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [freqIndex, setFreqIndex] = useState<FrequencyIndex | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/data/night-routes.json").then((r) => r.json()),
      fetch("/data/stops-geo.json").then((r) => r.json()),
      fetch("/data/frequencies-index.json").then((r) => r.json()),
    ]).then(([night, stops, freq]) => {
      setNightGeo(night);
      setStopsGeo(stops);
      setFreqIndex(freq);
    });
  }, []);

  if (!nightGeo || !stopsGeo || !freqIndex) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Cargando rutas nocturnas...</div>
      </div>
    );
  }

  // Get night routes info from freqIndex
  const nightRouteIds = [
    ...new Set(nightGeo.features.map((f) => f.properties?.route_id as string)),
  ];

  const nightRouteInfos = nightRouteIds
    .map((rid) => {
      const info = freqIndex[rid];
      if (!info) return null;
      const nightFreqs = info.frequencies.filter((f) => {
        const hour = parseInt(f.start_time.split(":")[0]);
        return hour >= 24;
      });
      return { route_id: rid, ...info, nightFrequencies: nightFreqs };
    })
    .filter(Boolean);

  // Filter stops that belong to night routes
  const nightAgencies = new Set(nightRouteInfos.map((r) => r!.agency_id));

  return (
    <div className="relative">
      {/* Night Info Panel */}
      <div className="absolute top-4 left-4 z-[500] bg-[#0a0a0a]/90 backdrop-blur rounded-lg p-4 w-80 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-purple-400 mb-1">
          🌙 Nocturno CDMX
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          {nightRouteIds.length} rutas con servicio despues de medianoche
        </p>

        <div className="space-y-3">
          {nightRouteInfos.map((route) => {
            if (!route) return null;
            return (
              <div
                key={route.route_id}
                className="bg-white/5 rounded-lg p-3 border border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-bold text-white">
                      {route.route_short_name}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {AGENCY_NAMES[route.agency_id] || route.agency_id}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  {route.route_long_name}
                </div>
                {route.nightFrequencies.length > 0 && (
                  <div className="text-xs text-purple-300 mt-2">
                    {formatTime(route.nightFrequencies[0].start_time)} -{" "}
                    {formatTime(route.nightFrequencies[0].end_time)} | cada{" "}
                    {formatHeadway(route.nightFrequencies[0].headway_secs)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <TransitMap>
        <RouteLayer data={nightGeo} weight={3} opacity={0.9} />
      </TransitMap>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/nocturno/
git commit -m "feat: add Nocturno night transit map page"
```

---

## Task 10: Build AI Route Planner (`/planifica`)

**Files:**
- Create: `src/app/api/planifica/route.ts`
- Create: `src/components/ChatPanel.tsx`
- Create: `src/app/planifica/page.tsx`

- [ ] **Step 1: Create `src/app/api/planifica/route.ts`**

```ts
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { readFileSync } from "fs";
import { join } from "path";

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
      return { ...f.properties, dist, lat: sLat, lon: sLon };
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
    for (const [rid, data] of entries) {
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
    model: anthropic("claude-sonnet-4-20250514"),
    system: contextInfo,
    messages,
  });

  return result.toDataStreamResponse();
}
```

- [ ] **Step 2: Create `src/components/ChatPanel.tsx`**

```tsx
"use client";

import { useChat } from "ai/react";
import { useRef, useEffect } from "react";

export default function ChatPanel() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ api: "/api/planifica" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-4">🧭</div>
            <h3 className="text-lg font-bold text-gray-300">Planifica tu ruta</h3>
            <p className="text-sm mt-2 max-w-xs mx-auto">
              Escribe de donde a donde quieres ir y te sugiero la mejor combinacion de transporte publico.
            </p>
            <div className="mt-4 space-y-2 text-xs">
              <p className="text-gray-600">Prueba:</p>
              <p className="text-[#e8734a]">&quot;De Coyoacan a Polanco&quot;</p>
              <p className="text-[#e8734a]">&quot;Como llego al aeropuerto desde CU?&quot;</p>
              <p className="text-[#e8734a]">&quot;Necesito ruta accesible de Tacubaya a Zocalo&quot;</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-[#e8734a] text-white"
                  : "bg-white/10 text-gray-200"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-lg px-4 py-2 text-sm text-gray-400 animate-pulse">
              Pensando...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="De donde a donde quieres ir?"
            className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e8734a]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#e8734a] text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-[#d4623a] transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/planifica/page.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const TransitMap = dynamic(() => import("@/components/TransitMap"), { ssr: false });
const RouteLayer = dynamic(() => import("@/components/RouteLayer"), { ssr: false });
import ChatPanel from "@/components/ChatPanel";

export default function PlanificaPage() {
  const [routesGeo, setRoutesGeo] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/data/routes-geo.json")
      .then((r) => r.json())
      .then(setRoutesGeo);
  }, []);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Chat Panel */}
      <div className="w-[400px] border-r border-white/10 flex-shrink-0 bg-[#0a0a0a]">
        <ChatPanel />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {routesGeo ? (
          <TransitMap className="h-full w-full">
            <RouteLayer data={routesGeo} opacity={0.4} weight={1.5} />
          </TransitMap>
        ) : (
          <div className="h-full flex items-center justify-center bg-[#1a1a2e]">
            <div className="text-gray-400 animate-pulse">Cargando mapa...</div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/planifica/ src/components/ChatPanel.tsx src/app/planifica/
git commit -m "feat: add AI route planner with Claude chat and transit context"
```

---

## Task 11: Final verification and polish

- [ ] **Step 1: Run the full app**

```bash
cd /Users/elias/Documents/Trabajo/180426/transit-cdmx
npm run dev
```

- [ ] **Step 2: Verify each page works**

1. `http://localhost:3000` — Map with all routes, agency filter works
2. `http://localhost:3000/planifica` — Chat panel loads, Claude responds
3. `http://localhost:3000/accesibilidad` — Stops colored by accessibility
4. `http://localhost:3000/pulso` — Dashboard charts render
5. `http://localhost:3000/nocturno` — Night routes display

- [ ] **Step 3: Fix any build errors**

```bash
npm run build
```

Fix any TypeScript or build errors that appear.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: Transit CDMX - complete app with 5 views for CDMX public transit"
```
