export type Severity = "info" | "warning" | "critical";
export type StationMode = "Auto" | "Manual" | "Fail-safe";
export type Connectivity = "Online" | "Degraded" | "Offline";

export interface Alert {
  id: string;
  severity: Severity;
  message: string;
  timestamp: string;
}

export interface EquipmentItem {
  id: string;
  type: string;
  health: "Good" | "Warning" | "Critical";
  lastServiced: string;
  nextService: string;
  metric: string;
  value: number;
}

export interface ForecastPoint {
  time: string;
  tempC: number;
  windSpeed: number;
  irradiance: number;
  solar_kW: number;
  wind_kW: number;
  solarActual_kW: number | null;
  windActual_kW: number | null;
  load_kW: number;
  loadActual_kW: number | null;
}

export interface DispatchPoint {
  time: string;
  solar_kW: number;
  wind_kW: number;
  battery_kW: number;
  fuelCell_kW: number;
  diesel_kW: number;
}

export interface TelemetrySample {
  time: string;
  renewable_pct: number;
  load_kW: number;
  soc_pct: number;
  solar_kW: number;
  wind_kW: number;
  diesel_kW: number;
}

export interface StationData {
  timestamp: string;
  station: {
    name: string;
    mode: StationMode;
    connectivity: Connectivity;
    outdoorTemp_C: number;
    windSpeed_ms: number;
  };
  sources: {
    solar: { output_kW: number; status: string; capacity_kW: number };
    wind: { output_kW: number; status: string; capacity_kW: number };
    diesel: { output_kW: number; status: string; fuelLevel_pct: number; capacity_kW: number };
    battery: { soc_pct: number; chargeRate_kW: number; status: string; temp_C: number };
    fuelCell: { output_kW: number; status: string; h2Level_pct: number };
  };
  load: { current_kW: number };
  kpis: {
    renewableFraction_pct: number;
    dieselUsed_L_ytd: number;
    co2Avoided_tons_ytd: number;
    uptime_pct: number;
    costSaved_usd_ytd: number;
  };
  comms: {
    satellite: Connectivity;
    bandwidth_kbps: number;
    lastSync: string;
    queuedPackets: number;
    security: string;
  };
  dispatch: {
    decision: string;
    reason: string;
    objective: string;
    updatedAt: string;
  };
  alerts: Alert[];
  equipment: EquipmentItem[];
  forecast: ForecastPoint[];
  plan: DispatchPoint[];
  history: TelemetrySample[];
  logs: { time: string; text: string; severity: Severity }[];
}

export type ScenarioId = "storm" | "outage" | "batteryLow" | "darkness";
