import React from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { THEME, AGENCY_COLORS } from '@/constants/Theme';
import stats from '@/assets/data/stats.json';

const screenWidth = Dimensions.get('window').width;

export default function PulsoScreen() {
  const chartData = {
    labels: stats.routesByAgency.slice(0, 6).map(d => d.agency),
    datasets: [{
      data: stats.routesByAgency.slice(0, 6).map(d => d.count)
    }]
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.grid}>
        <StatCard label="Paradas" value={stats.totalStops.toLocaleString()} />
        <StatCard label="Rutas" value={stats.totalRoutes.toLocaleString()} />
        <StatCard label="Sistemas" value={stats.totalAgencies.toString()} />
        <StatCard label="Nocturnas" value={stats.nightRouteCount.toString()} color="#a78bfa" />
      </View>

      <Text style={styles.chartTitle}>Rutas por Sistema</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 30}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: THEME.card,
          backgroundGradientFrom: THEME.card,
          backgroundGradientTo: THEME.card,
          decimalPlaces: 0,
          color: (opacity = 1) => THEME.accent,
          labelColor: (opacity = 1) => '#888',
          style: { borderRadius: 16 },
        }}
        verticalLabelRotation={30}
        style={styles.chart}
      />
    </ScrollView>
  );
}

function StatCard({ label, value, color = THEME.accent }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  content: {
    padding: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: THEME.card,
    width: '48%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cardLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
});
