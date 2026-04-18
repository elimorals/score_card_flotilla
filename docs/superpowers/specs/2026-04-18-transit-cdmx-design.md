# Transit CDMX - Design Spec

## Context

Proyecto para el Claude Impact Lab CDMX (18 abril 2026). Track: Movilidad Inteligente.
Datos: GTFS estatico de CDMX (datos.cdmx.gob.mx) con 10 agencias, 301 rutas, 11,362 paradas.
Restriccion: 5 horas de build, entrega como repo open source + video 1 min.

## Objetivo

App web unificada que integra 4 funcionalidades sobre transporte publico CDMX:
1. Mapa interactivo general de todo el sistema de transporte
2. Planificador de rutas con IA conversacional (Claude)
3. Mapa de accesibilidad para personas con discapacidad
4. Dashboard de cobertura y frecuencias
5. Guia de transporte nocturno

## Stack

- Next.js 15 (App Router)
- react-leaflet + Leaflet (mapas open source)
- Recharts (graficas)
- Tailwind CSS (estilos)
- Vercel AI SDK + Claude API (planificador IA)
- GTFS pre-procesado a JSON estatico

## Arquitectura

### Procesamiento de datos (build time)

Script `scripts/process-gtfs.ts` que:
1. Lee los 8 CSV de `gtfs/`
2. Genera GeoJSON de rutas (shapes.txt -> LineString por ruta con metadata de routes.txt)
3. Genera GeoJSON de paradas (stops.txt -> Point con wheelchair_boarding, rutas asociadas via stop_times+trips)
4. Genera indice de frecuencias (frequencies.txt indexado por route_id con horarios)
5. Filtra rutas nocturnas (start_time >= 24:00:00)
6. Output: archivos JSON en `public/data/`

### Rutas de la app

| Ruta | Funcion | Componentes clave |
|---|---|---|
| `/` | Landing + Mapa general | TransitMap, RouteLayer, StopPopup |
| `/planifica` | Chat IA + mapa | ChatPanel, TransitMap, API route |
| `/accesibilidad` | Mapa accesibilidad | TransitMap con filtro wheelchair |
| `/pulso` | Dashboard estadisticas | Recharts, StatsCard |
| `/nocturno` | Mapa nocturno | TransitMap filtrado, NightPanel |

### API Route: `/api/planifica`

- Recibe: mensaje del usuario (texto libre)
- Proceso:
  1. Extrae origen/destino del mensaje (Claude lo interpreta)
  2. Busca paradas cercanas al origen (radio 1km, Haversine)
  3. Busca paradas cercanas al destino
  4. Arma contexto con rutas, frecuencias y conexiones
  5. Claude razona la mejor ruta con transbordos
- Responde: texto con instrucciones + IDs de paradas/rutas para dibujar en mapa

### Componentes compartidos

- `TransitMap.tsx`: Mapa Leaflet reutilizable con props para capas, centro, zoom
- `RouteLayer.tsx`: Renderiza GeoJSON de una ruta con color
- `StopPopup.tsx`: Popup de parada con nombre, sistema, accesibilidad
- `ChatPanel.tsx`: Panel de chat con input y mensajes
- `StatsCard.tsx`: Tarjeta de estadistica con numero + label
- `NavBar.tsx`: Navegacion entre vistas

### Datos pre-procesados

- `routes-geo.json`: FeatureCollection de LineString, ~301 features con properties {route_id, agency_id, route_short_name, route_long_name, route_color}
- `stops-geo.json`: FeatureCollection de Point, ~11,362 features con properties {stop_id, stop_name, wheelchair_boarding, routes: string[]}
- `frequencies-index.json`: {[route_id]: {trips: [{start_time, end_time, headway_secs}]}}
- `night-routes.json`: subset de routes-geo con solo rutas nocturnas
- `stats.json`: totales pre-calculados para dashboard

## Criterios de exito

- Mapa carga con todas las rutas coloreadas por sistema
- Se pueden toggle capas por agencia
- Chat con Claude sugiere rutas razonables
- Mapa de accesibilidad muestra paradas con codigo de colores
- Dashboard muestra estadisticas reales
- Mapa nocturno filtra correctamente

## Simplificaciones (YAGNI para 5 hrs)

- No pathfinding real (Dijkstra/RAPTOR) - Claude razona rutas
- No SSR para mapas (client-side only con dynamic import)
- No base de datos - JSON estatico
- No autenticacion
- No i18n (solo espanol)
- Tema oscuro fijo (no toggle)
