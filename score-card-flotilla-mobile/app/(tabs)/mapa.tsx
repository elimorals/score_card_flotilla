import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { THEME, CDMX_CENTER, AGENCY_COLORS } from '@/constants/Theme';
import routesGeo from '@/assets/data/routes-geo.json';

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

  const filteredFeatures = selectedAgency
    ? routesGeo.features.filter((f: any) => f.properties.agency_id === selectedAgency)
    : routesGeo.features;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...CDMX_CENTER,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }}
        userInterfaceStyle="dark"
        customMapStyle={mapStyle}
      >
        {filteredFeatures.map((feature: any, idx: number) => {
          const coords = feature.geometry.coordinates.map((c: any) => ({
            longitude: c[0],
            latitude: c[1],
          }));
          return (
            <Polyline
              key={`${feature.properties.route_id}-${idx}`}
              coordinates={coords}
              strokeColor={`#${feature.properties.route_color}`}
              strokeWidth={2}
            />
          );
        })}
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
                selectedAgency === aid && { backgroundColor: AGENCY_COLORS[aid] || THEME.accent }
              ]}
            >
              <View style={[styles.dot, { backgroundColor: AGENCY_COLORS[aid] || '#888' }]} />
              <Text style={styles.chipText}>{aid}</Text>
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
    top: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  scroll: {
    flexDirection: 'row',
  },
  agencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
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
