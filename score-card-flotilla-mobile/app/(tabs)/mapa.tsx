import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { THEME, CDMX_CENTER, AGENCY_COLORS, AGENCY_NAMES, WHEELCHAIR_COLORS } from '@/constants/Theme';
import routesGeo from '@/assets/data/routes-geo.json';
import stopsGeo from '@/assets/data/stops-geo.json';

export default function MapaScreen() {
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<string[]>([]);

  useEffect(() => {
    const uniqueAgencies = [
      ...new Set(
        routesGeo.features.map((f: any) => f.properties.agency_id)
      ),
    ] as string[];
    setAgencies(uniqueAgencies.sort());
  }, []);

  const filteredRoutes = selectedAgency
    ? routesGeo.features.filter((f: any) => f.properties.agency_id === selectedAgency)
    : routesGeo.features;

  // Filtrar paradas solo si hay una agencia seleccionada (para no saturar el mapa)
  const filteredStops = selectedAgency
    ? stopsGeo.features.filter((f: any) => f.properties.routes.some((r: string) => {
        // En una implementación real, esto cruzaría con el ID de ruta
        // Por ahora filtramos si la parada pertenece a la agencia seleccionada (simplificado)
        return true; 
      }) && (selectedAgency === 'METRO' ? f.properties.stop_id.includes('') : true)) // Filtro simplificado
    : [];

  // Mejora del filtro de paradas: los datos reales suelen tener el agency_id o rutas
  const stopsToShow = selectedAgency 
    ? stopsGeo.features.filter((f: any) => {
        // Intentar deducir si la parada pertenece a la agencia
        // Esto depende de cómo se procesó el GTFS, generalmente se hace por los prefijos o rutas
        return f.properties.routes.some((r: string) => r.startsWith(selectedAgency.substring(0,2)));
      }).slice(0, 150) // Limitamos a 150 por performance en mobile
    : [];

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...CDMX_CENTER,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        userInterfaceStyle="dark"
        customMapStyle={mapStyle}
      >
        {/* Dibujar Rutas */}
        {filteredRoutes.map((feature: any, idx: number) => {
          const coords = feature.geometry.coordinates.map((c: any) => ({
            longitude: c[0],
            latitude: c[1],
          }));
          return (
            <Polyline
              key={`route-${feature.properties.route_id}-${idx}`}
              coordinates={coords}
              strokeColor={`#${feature.properties.route_color}`}
              strokeWidth={selectedAgency ? 3 : 1.5}
            />
          );
        })}

        {/* Dibujar Paradas (Solo si hay agencia seleccionada) */}
        {stopsToShow.map((stop: any) => (
          <Marker
            key={`stop-${stop.properties.stop_id}`}
            coordinate={{
              longitude: stop.geometry.coordinates[0],
              latitude: stop.geometry.coordinates[1],
            }}
            pinColor={WHEELCHAIR_COLORS[stop.properties.wheelchair_boarding] || '#888'}
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{stop.properties.stop_name}</Text>
                <Text style={styles.calloutText}>
                  {stop.properties.wheelchair_boarding === 1 ? '♿ Accesible' : '🚫 No accesible'}
                </Text>
                <Text style={styles.calloutSub}>Siguiente llegada: 5 min</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.legendContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
          <TouchableOpacity
            onPress={() => setSelectedAgency(null)}
            style={[
              styles.agencyChip,
              selectedAgency === null && styles.activeChip
            ]}
          >
            <Text style={styles.chipText}>Todos</Text>
          </TouchableOpacity>
          {agencies.map((aid) => (
            <TouchableOpacity
              key={aid}
              onPress={() => setSelectedAgency(aid)}
              style={[
                styles.agencyChip,
                selectedAgency === aid && { backgroundColor: AGENCY_COLORS[aid] || THEME.accent, borderColor: 'transparent' }
              ]}
            >
              <View style={[styles.dot, { backgroundColor: selectedAgency === aid ? '#fff' : (AGENCY_COLORS[aid] || '#888') }]} />
              <Text style={styles.chipText}>{AGENCY_NAMES[aid] || aid}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  map: {
    flex: 1,
  },
  legendContainer: {
    position: 'absolute',
    top: 50, // Bajamos un poco por el notch/header
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  scroll: {
    flexDirection: 'row',
  },
  agencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  activeChip: {
    backgroundColor: THEME.accent,
    borderColor: THEME.accent,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  callout: {
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    width: 200,
  },
  calloutTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 2,
  },
  calloutSub: {
    color: THEME.accent,
    fontSize: 11,
    marginTop: 4,
    fontWeight: 'bold',
  }
});

const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];
