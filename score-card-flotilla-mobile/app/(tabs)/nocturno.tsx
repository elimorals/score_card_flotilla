import React from 'react';
import { StyleSheet, View, Text, FlatList, Platform } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { THEME, CDMX_CENTER, AGENCY_COLORS } from '@/constants/Theme';
import nightRoutesGeo from '@/assets/data/night-routes.json';
import freqIndex from '@/assets/data/frequencies-index.json';

export default function NocturnoScreen() {
  const routes = nightRoutesGeo.features;

  const renderRouteItem = ({ item }: { item: any }) => {
    const rid = item.properties.route_id;
    const info = (freqIndex as any)[rid];
    
    return (
      <View style={styles.routeCard}>
        <View style={styles.routeHeader}>
          <Text style={styles.routeShortName}>{item.properties.route_short_name}</Text>
          <Text style={styles.agencyName}>{item.properties.agency_id}</Text>
        </View>
        <Text style={styles.routeLongName}>{item.properties.route_long_name}</Text>
        {info && info.frequencies[0] && (
          <Text style={styles.timeInfo}>
            {info.frequencies[0].start_time} - {info.frequencies[0].end_time}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            ...CDMX_CENTER,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }}
          customMapStyle={mapStyle}
        >
          {routes.map((feature: any, idx: number) => (
            <Polyline
              key={`${feature.properties.route_id}-${idx}`}
              coordinates={feature.geometry.coordinates.map((c: any) => ({
                longitude: c[0],
                latitude: c[1],
              }))}
              strokeColor="#a78bfa"
              strokeWidth={3}
            />
          ))}
        </MapView>
      </View>

      <FlatList
        data={routes}
        renderItem={renderRouteItem}
        keyExtractor={(item, idx) => `${item.properties.route_id}-${idx}`}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.listTitle}>Rutas Nocturnas</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  mapContainer: {
    height: '40%',
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  map: {
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  listTitle: {
    color: '#a78bfa',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  routeCard: {
    backgroundColor: THEME.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  routeShortName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  agencyName: {
    color: '#888',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  routeLongName: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 8,
  },
  timeInfo: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#1a1a2e" }] },
  { "featureType": "water", "stylers": [{ "color": "#000000" }] }
];
