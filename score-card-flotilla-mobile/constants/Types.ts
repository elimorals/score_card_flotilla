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
