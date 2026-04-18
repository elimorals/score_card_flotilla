import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { THEME, CDMX_CENTER, WHEELCHAIR_COLORS } from '@/constants/Theme';
import stopsGeo from '@/assets/data/stops-geo.json';

const LABELS: Record<number, string> = {
  0: "Sin info",
  1: "Accesible",
  2: "No accesible",
};

export default function AccesibilidadScreen() {
  const [filter, setFilter] = useState<number | null>(null);

  const filteredStops = filter !== null
    ? stopsGeo.features.filter((f: any) => f.properties.wheelchair_boarding === filter).slice(0, 500)
    : stopsGeo.features.slice(0, 500); // Limit to 500 for performance on mobile

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
        customMapStyle={mapStyle}
      >
        {filteredStops.map((feature: any) => {
          const color = WHEELCHAIR_COLORS[feature.properties.wheelchair_boarding] || '#888';
          return (
            <Circle
              key={feature.properties.stop_id}
              center={{
                longitude: feature.geometry.coordinates[0],
                latitude: feature.geometry.coordinates[1],
              }}
              radius={30}
              fillColor={color}
              strokeColor="white"
              strokeWidth={1}
            />
          );
        })}
      </MapView>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setFilter(null)}
            style={[styles.filterChip, filter === null && styles.activeChip]}
          >
            <Text style={styles.chipText}>Todas</Text>
          </TouchableOpacity>
          {[1, 2, 0].map((val) => (
            <TouchableOpacity
              key={val}
              onPress={() => setFilter(val)}
              style={[
                styles.filterChip,
                filter === val && { backgroundColor: WHEELCHAIR_COLORS[val] }
              ]}
            >
              <Text style={styles.chipText}>{LABELS[val]}</Text>
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
  filterContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  filterChip: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  activeChip: {
    backgroundColor: THEME.accent,
    borderColor: THEME.accent,
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "featureType": "water", "stylers": [{ "color": "#000000" }] }
];
