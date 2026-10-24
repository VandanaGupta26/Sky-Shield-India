// SkyShield TypeScript Interface Definitions

export type RiskBand = 'safe' | 'caution' | 'high' | 'extreme' | 'critical';

export interface WbgtMetrics {
  air_temperature_c: number;
  relative_humidity_pct: number;
  wind_speed_mps: number;
  solar_radiation_wm2: number;
  wet_bulb_c: number;
  globe_temperature_c: number;
  wbgt_outdoor_c: number;
  wbgt_indoor_c: number;
  vapor_pressure_hpa: number;
  heat_index_c: number;
  risk_level: string;
  risk_color: string;
  risk_class: RiskBand;
  action_summary: string;
  formula_documentation: string;
}

export interface ImdHeatwaveInfo {
  temp_max_c: number;
  normal_max_c: number;
  departure_c: number;
  terrain_type: string;
  threshold_c: number;
  is_heatwave: boolean;
  is_severe: boolean;
  category: string;
  badge_color: string;
  imd_criteria_note: string;
}

export interface ForecastDay {
  date: string;
  temp_max_c: number;
  temp_min_c: number;
  estimated_wbgt_max_c: number;
  risk_level: string;
  risk_color: string;
}

export interface CityStation {
  city_id: string;
  city_name: string;
  state: string;
  lat: number;
  lon: number;
  source: string;
  is_simulated: boolean;
  current: {
    temperature_c: number;
    relative_humidity_pct: number;
    wind_speed_mps: number;
    solar_radiation_wm2: number;
    surface_pressure_hpa: number;
    wbgt: WbgtMetrics;
    heatwave: ImdHeatwaveInfo;
  };
  forecast_7day?: ForecastDay[];
}

export interface TrackPoint {
  lead_time_hr: number;
  timestamp_offset: string;
  lat: number;
  lon: number;
  wind_kmh: number;
  wind_knots: number;
  pressure_hpa: number;
  cone_radius_km: number;
  imd_category: string;
  alert_level: string;
}

export interface LandfallInfo {
  predicted_landfall_time: string;
  coastal_sector: string;
  primary_district: string;
  landfall_lat: number;
  landfall_lon: number;
  wind_at_landfall_kmh: number;
  storm_surge_m: number;
  districts_under_red_alert: string[];
}

export interface ExplainabilityFeature {
  feature: string;
  value: string;
  importance_pct: number;
  impact: string;
  description: string;
}

export interface StormPrediction {
  storm_id: string;
  name: string;
  basin: string;
  current_position: { lat: number; lon: number };
  current_intensity: string;
  current_wind_kmh: number;
  current_pressure_hpa: number;
  peak_forecast_wind_kmh: number;
  peak_category: string;
  alert_status: string;
  probability_of_genesis: number;
  confidence_meter_pct: number;
  track_forecast: TrackPoint[];
  landfall: LandfallInfo;
  explainability: ExplainabilityFeature[];
  model_comparison: Record<string, any>;
  is_simulated: boolean;
  disclaimer: string;
}

export interface HistoricalStorm {
  id: string;
  name: string;
  year: number;
  basin: string;
  max_category: string;
  peak_wind_kmh: number;
  landfall_area: string;
  landfall_date: string;
  key_stats: { fatalities: number; evacuated: string; central_pressure: number };
  track: Array<{ step: number; time: string; lat: number; lon: number; wind_kmh: number; cat: string }>;
}

export interface NowcastFrame {
  label: string;
  timestamp_iso: string;
  is_predicted: boolean;
  eye_center: { lat: number; lon: number };
  max_reflectivity_dbz: number;
  rain_rate_mm_hr: number;
  eyewall_radius_km: number;
}

export interface SatellitePacket {
  sync_marker: string;
  frame_counter: number;
  timestamp: string;
  apid_hex: string;
  channel: string;
  snr_db: number;
  ber: number;
  rs_corrected_symbols: number;
  status: 'OK' | 'CORRECTED' | 'CORRUPTED';
  hex_preview: string;
  scanline_index: number;
}

export interface PipelineStage {
  stage_id: number;
  name: string;
  status: 'ACTIVE' | 'LOCKED' | 'PROCESSING' | 'STREAMING';
  metrics: Record<string, any>;
}

export interface DerivedProduct {
  id: string;
  title: string;
  sensor: string;
  interpretation: string;
  status_badge: string;
  [key: string]: any;
}

export interface SatellitePass {
  satellite: string;
  orbit_type: string;
  sub_satellite_point: string;
  next_scan_time: string;
  scan_type: string;
  elevation_deg: number;
  status: string;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  hazard: string;
  severity: string;
  region: string;
  headline: string;
  color: string;
}

export interface DistrictRisk {
  district: string;
  state: string;
  composite_risk_score: number;
  risk_level: string;
  color: string;
  population_total: string;
  vulnerable_population: string;
  outdoor_workers: string;
  primary_threat: string;
  lat: number;
  lon: number;
}

export interface CoolingCentre {
  id: string;
  name: string;
  city: string;
  type: string;
  lat: number;
  lon: number;
  capacity: number;
  operating_hours: string;
  amenities: string[];
  contact: string;
}

export interface CitizenReportItem {
  id: string;
  category: string;
  description: string;
  location_name: string;
  lat: number;
  lon: number;
  intensity_rating: number;
  reporter_name: string;
  verified: boolean;
  timestamp: string;
  photo_url?: string;
}
