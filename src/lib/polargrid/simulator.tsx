import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Alert,
  DispatchPoint,
  ForecastPoint,
  ScenarioId,
  StationData,
  TelemetrySample,
} from "./types";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const rnd = (spread: number) => (Math.random() - 0.5) * 2 * spread;
const round = (v: number, d = 1) => Number(v.toFixed(d));

function hhmm(offsetHours: number) {
  const d = new Date(Date.now() + offsetHours * 3600_000);
  return `${String(d.getUTCHours()).padStart(2, "0")}:00`;
}

function buildForecast(): ForecastPoint[] {
  const pts: ForecastPoint[] = [];
  for (let i = -6; i < 24; i++) {
    const solar = clamp(6 * Math.sin(((i + 24) / 24) * Math.PI * 2 - 1.2) + 2.5, 0, 8.8);
    const wind = clamp(20 + 10 * Math.sin(i / 3.5) + rnd(3), 0, 54);
    const load = 21 + 3 * Math.sin(i / 4) + rnd(1);
    const past = i < 0;
    pts.push({
      time: hhmm(i),
      tempC: round(-28 + 4 * Math.sin(i / 5) + rnd(1)),
      windSpeed: round(8 + wind / 6),
      irradiance: round(solar * 26, 0),
      solar_kW: round(solar),
      wind_kW: round(wind),
      solarActual_kW: past ? round(clamp(solar + rnd(0.8), 0, 9)) : null,
      windActual_kW: past ? round(clamp(wind + rnd(2.5), 0, 54)) : null,
      load_kW: round(load),
      loadActual_kW: past ? round(load + rnd(1.2)) : null,
    });
  }
  return pts;
}

function buildPlan(dieselHeavy: boolean): DispatchPoint[] {
  const pts: DispatchPoint[] = [];
  for (let i = 0; i < 24; i++) {
    const solar = dieselHeavy ? 0 : clamp(5.5 * Math.sin((i / 24) * Math.PI * 2 - 1.2) + 2, 0, 8.8);
    const wind = dieselHeavy ? clamp(4 + rnd(3), 0, 10) : clamp(18 + 9 * Math.sin(i / 3.5), 2, 46);
    const load = 22 + 3 * Math.sin(i / 4);
    const renew = solar + wind;
    const deficit = load - renew;
    const battery = clamp(deficit > 0 ? Math.min(deficit, 8) : Math.max(deficit, -9), -9, 8);
    const rest = clamp(deficit - Math.max(battery, 0), 0, 30);
    const fuelCell = clamp(Math.min(rest, 4), 0, 4);
    const diesel = clamp(rest - fuelCell, 0, 30);
    pts.push({
      time: hhmm(i),
      solar_kW: round(solar),
      wind_kW: round(wind),
      battery_kW: round(Math.max(battery, 0)),
      fuelCell_kW: round(fuelCell),
      diesel_kW: round(diesel),
    });
  }
  return pts;
}

function buildHistory(): TelemetrySample[] {
  const out: TelemetrySample[] = [];
  for (let i = -30; i <= 0; i++) {
    const solar = clamp(4 + rnd(2), 0, 8.8);
    const wind = clamp(19 + rnd(6), 0, 54);
    out.push({
      time: hhmm(i / 6),
      solar_kW: round(solar),
      wind_kW: round(wind),
      diesel_kW: 0,
      load_kW: round(22 + rnd(2)),
      soc_pct: round(clamp(72 + rnd(6), 20, 100)),
      renewable_pct: round(clamp(66 + rnd(8), 0, 100)),
    });
  }
  return out;
}

function initialData(): StationData {
  const now = new Date().toISOString();
  return {
    timestamp: now,
    station: {
      name: "Aurora Ridge Station",
      mode: "Auto",
      connectivity: "Online",
      outdoorTemp_C: -28.5,
      windSpeed_ms: 12.3,
    },
    sources: {
      solar: { output_kW: 4.2, status: "Normal", capacity_kW: 8.8 },
      wind: { output_kW: 18.7, status: "Normal", capacity_kW: 54 },
      diesel: { output_kW: 0, status: "Standby", fuelLevel_pct: 82, capacity_kW: 40 },
      battery: { soc_pct: 76, chargeRate_kW: 5.1, status: "Charging", temp_C: 14 },
      fuelCell: { output_kW: 0, status: "Idle", h2Level_pct: 60 },
    },
    load: { current_kW: 22.9 },
    kpis: {
      renewableFraction_pct: 68,
      dieselUsed_L_ytd: 4200,
      co2Avoided_tons_ytd: 11.4,
      uptime_pct: 99.8,
      costSaved_usd_ytd: 48200,
    },
    comms: {
      satellite: "Online",
      bandwidth_kbps: 512,
      lastSync: now,
      queuedPackets: 3,
      security: "All systems patched",
    },
    dispatch: {
      decision: "Charging battery from solar and wind surplus; diesel on standby",
      reason:
        "Forecast wind stays above 15 kW for 6 h and load is stable. Storing surplus now avoids a diesel start during the pre-dawn load peak.",
      objective: "Minimize fuel burn",
      updatedAt: now,
    },
    alerts: [
      {
        id: "a1",
        severity: "warning",
        message: "Wind turbine WT-03: possible blade icing detected",
        timestamp: now,
      },
      {
        id: "a2",
        severity: "info",
        message: "Battery bank BAT-01 balancing cycle scheduled 02:00",
        timestamp: now,
      },
    ],
    equipment: [
      { id: "WT-01", type: "Wind Turbine", health: "Good", lastServiced: "2026-06-01", nextService: "2026-12-01", metric: "Vibration (mm/s)", value: 2.1 },
      { id: "WT-03", type: "Wind Turbine", health: "Warning", lastServiced: "2026-04-18", nextService: "2026-09-20", metric: "Vibration (mm/s)", value: 5.8 },
      { id: "BAT-01", type: "Battery Bank", health: "Warning", lastServiced: "2026-05-15", nextService: "2026-10-02", metric: "Cell temp (°C)", value: 31 },
      { id: "DG-01", type: "Diesel Generator", health: "Good", lastServiced: "2026-07-11", nextService: "2027-01-11", metric: "Oil condition (%)", value: 88 },
      { id: "FC-01", type: "Fuel Cell", health: "Good", lastServiced: "2026-03-02", nextService: "2026-11-02", metric: "Stack eff. (%)", value: 54 },
      { id: "PV-A", type: "Solar Array", health: "Good", lastServiced: "2026-08-01", nextService: "2027-02-01", metric: "Soiling loss (%)", value: 3.2 },
    ],
    forecast: buildForecast(),
    plan: buildPlan(false),
    history: buildHistory(),
    logs: [
      { time: now, text: "EMS optimizer cycle completed (horizon 24 h)", severity: "info" },
      { time: now, text: "DTN sync completed — 3 packets queued", severity: "info" },
    ],
  };
}

export type OverrideKey = "solar" | "wind" | "diesel" | "battery" | "fuelCell";

interface Ctx {
  data: StationData;
  live: boolean;
  setLive: (v: boolean) => void;
  scenarios: Record<ScenarioId, boolean>;
  toggleScenario: (id: ScenarioId) => void;
  resetScenarios: () => void;
  objective: string;
  setObjective: (v: string) => void;
  overrides: Record<OverrideKey, boolean>;
  setOverride: (k: OverrideKey, v: boolean) => void;
}

const PolarGridContext = createContext<Ctx | null>(null);

export function PolarGridProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StationData>(() => initialData());
  const [live, setLive] = useState(false);
  const [objective, setObjective] = useState("Minimize fuel burn");
  const [overrides, setOverrides] = useState<Record<OverrideKey, boolean>>({
    solar: true,
    wind: true,
    diesel: true,
    battery: true,
    fuelCell: true,
  });
  const [scenarios, setScenarios] = useState<Record<ScenarioId, boolean>>({
    storm: false,
    outage: false,
    batteryLow: false,
    darkness: false,
  });

  const scenariosRef = useRef(scenarios);
  scenariosRef.current = scenarios;
  const objectiveRef = useRef(objective);
  objectiveRef.current = objective;
  const overridesRef = useRef(overrides);
  overridesRef.current = overrides;

  const setOverride = useCallback((k: OverrideKey, v: boolean) => {
    setOverrides((prev) => ({ ...prev, [k]: v }));
  }, []);

  const toggleScenario = useCallback((id: ScenarioId) => {
    setScenarios((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      return next;
    });
    setData((prev) => {
      const now = new Date().toISOString();
      const on = !scenariosRef.current[id];
      const label: Record<ScenarioId, string> = {
        storm: "Category 2 polar storm",
        outage: "Satellite comms outage",
        batteryLow: "Battery bank depletion",
        darkness: "Polar winter darkness",
      };
      const alert: Alert = {
        id: `${id}-${Date.now()}`,
        severity: id === "outage" || id === "batteryLow" ? "critical" : "warning",
        message: on
          ? `Scenario injected: ${label[id]} — EMS re-optimizing dispatch`
          : `Scenario cleared: ${label[id]} — returning to nominal dispatch`,
        timestamp: now,
      };
      return {
        ...prev,
        alerts: [alert, ...prev.alerts].slice(0, 8),
        logs: [{ time: now, text: alert.message, severity: alert.severity }, ...prev.logs].slice(0, 40),
      };
    });
  }, []);

  const resetScenarios = useCallback(() => {
    setScenarios({ storm: false, outage: false, batteryLow: false, darkness: false });
    setData((prev) => ({
      ...prev,
      alerts: [
        {
          id: `reset-${Date.now()}`,
          severity: "info",
          message: "All scenarios cleared — station returned to nominal operation",
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  useEffect(() => {
    const tick = () => {
      const sc = scenariosRef.current;
      const ov = overridesRef.current;
      setData((prev) => {
        const now = new Date().toISOString();
        const s = prev.sources;

        // Solar
        const solarCeiling = sc.darkness ? 0.2 : sc.storm ? 1.6 : 8.8;
        let solar = clamp(s.solar.output_kW + rnd(0.7), 0, solarCeiling);
        if (!ov.solar) solar = 0;

        // Wind
        const windTarget = sc.storm ? 3 : 19;
        let wind = clamp(s.wind.output_kW + (windTarget - s.wind.output_kW) * 0.25 + rnd(2), 0, 54);
        if (!ov.wind) wind = 0;

        const load = clamp(prev.load.current_kW + rnd(0.9), 16, 34);

        // Battery
        const socFloor = sc.batteryLow ? 12 : 20;
        let soc = s.battery.soc_pct;
        const renew = solar + wind;
        let deficit = load - renew;

        let battery = 0;
        if (deficit < 0) {
          battery = clamp(deficit, -9, 0); // charging (negative = into battery)
        } else if (soc > socFloor + 5 && ov.battery && !sc.batteryLow) {
          battery = clamp(Math.min(deficit, 8), 0, 8);
        }
        deficit -= Math.max(battery, 0);

        let fuelCell = clamp(Math.min(Math.max(deficit, 0), 4), 0, 4);
        if (!ov.fuelCell) fuelCell = 0;
        deficit -= fuelCell;

        let diesel = clamp(Math.max(deficit, 0), 0, 40);
        if (!ov.diesel) diesel = 0;
        if (sc.batteryLow) diesel = Math.max(diesel, 12);

        soc = clamp(soc - (battery > 0 ? battery : battery) * 0.05, sc.batteryLow ? 8 : 15, 100);
        if (sc.batteryLow) soc = clamp(Math.min(soc, 18) + rnd(0.6), 6, 20);

        const renewablePct = clamp((renew / Math.max(load, 0.1)) * 100, 0, 100);
        const connectivity = sc.outage ? "Offline" : sc.storm ? "Degraded" : "Online";
        const mode = sc.outage ? "Fail-safe" : sc.storm ? "Auto" : prev.station.mode === "Manual" ? "Manual" : "Auto";

        const decision = sc.outage
          ? "Fail-safe mode: holding last known-good dispatch, diesel primed for autonomous start"
          : sc.batteryLow
            ? "Battery below reserve floor — diesel generator online to recharge bank and carry load"
            : sc.storm
              ? "Storm dispatch: turbines feathered, diesel carrying deficit, battery held as reserve"
              : diesel > 1
                ? "Diesel trimming residual deficit; renewables prioritized on the bus"
                : battery < -0.5
                  ? "Charging battery from renewable surplus; diesel on standby"
                  : "Renewables + battery covering full station load; diesel on standby";

        const reason = sc.outage
          ? "Satellite link lost. Optimizer is running locally on cached forecasts and will not accept remote setpoints until sync resumes."
          : sc.batteryLow
            ? `State of charge ${round(soc)}% is under the ${socFloor}% reserve floor set for life-support autonomy.`
            : sc.storm
              ? "Wind speeds exceed the cut-out threshold and irradiance has collapsed; diesel is the lowest-risk firm source."
              : `Forecast renewable output covers ${round(renewablePct)}% of load for the next hours; storing surplus avoids a diesel start later.`;

        const newAlerts: Alert[] = [];
        if (soc < 25 && prev.sources.battery.soc_pct >= 25) {
          newAlerts.push({ id: `soc-${Date.now()}`, severity: "critical", message: `Battery SOC critical (${round(soc)}%) — load shedding armed`, timestamp: now });
        }
        if (diesel > 1 && prev.sources.diesel.output_kW <= 1) {
          newAlerts.push({ id: `dg-${Date.now()}`, severity: "warning", message: "Diesel generator DG-01 started to cover deficit", timestamp: now });
        }

        const history = [
          ...prev.history.slice(-59),
          {
            time: new Date().toISOString().slice(11, 16),
            renewable_pct: round(renewablePct),
            load_kW: round(load),
            soc_pct: round(soc),
            solar_kW: round(solar),
            wind_kW: round(wind),
            diesel_kW: round(diesel),
          },
        ];

        return {
          ...prev,
          timestamp: now,
          station: {
            ...prev.station,
            mode,
            connectivity,
            outdoorTemp_C: round(clamp(prev.station.outdoorTemp_C + rnd(0.4) + (sc.storm ? -0.3 : 0), -52, -8)),
            windSpeed_ms: round(clamp(prev.station.windSpeed_ms + rnd(0.8) + (sc.storm ? 1.6 : 0), 0, 45)),
          },
          sources: {
            solar: { ...s.solar, output_kW: round(solar), status: !ov.solar ? "Offline" : solar < 0.4 ? "Dark" : "Normal" },
            wind: { ...s.wind, output_kW: round(wind), status: !ov.wind ? "Offline" : sc.storm ? "Feathered" : "Normal" },
            diesel: {
              ...s.diesel,
              output_kW: round(diesel),
              status: !ov.diesel ? "Locked out" : diesel > 1 ? "Running" : "Standby",
              fuelLevel_pct: round(clamp(s.diesel.fuelLevel_pct - diesel * 0.002, 0, 100)),
            },
            battery: {
              soc_pct: round(soc),
              chargeRate_kW: round(Math.abs(battery)),
              status: !ov.battery ? "Isolated" : battery < -0.3 ? "Charging" : battery > 0.3 ? "Discharging" : "Idle",
              temp_C: round(clamp(s.battery.temp_C + rnd(0.3), 4, 38)),
            },
            fuelCell: {
              output_kW: round(fuelCell),
              status: fuelCell > 0.2 ? "Running" : "Idle",
              h2Level_pct: round(clamp(s.fuelCell.h2Level_pct - fuelCell * 0.004, 0, 100)),
            },
          },
          load: { current_kW: round(load) },
          kpis: {
            renewableFraction_pct: round(prev.kpis.renewableFraction_pct * 0.9 + renewablePct * 0.1),
            dieselUsed_L_ytd: round(prev.kpis.dieselUsed_L_ytd + diesel * 0.03, 1),
            co2Avoided_tons_ytd: round(prev.kpis.co2Avoided_tons_ytd + renew * 0.0004, 3),
            uptime_pct: round(clamp(prev.kpis.uptime_pct + (sc.outage ? -0.002 : 0.0005), 90, 100), 3),
            costSaved_usd_ytd: Math.round(prev.kpis.costSaved_usd_ytd + renew * 0.09),
          },
          comms: {
            ...prev.comms,
            satellite: connectivity,
            bandwidth_kbps: sc.outage ? 0 : sc.storm ? 96 : round(clamp(prev.comms.bandwidth_kbps + rnd(40), 128, 1024), 0),
            lastSync: sc.outage ? prev.comms.lastSync : now,
            queuedPackets: sc.outage ? prev.comms.queuedPackets + 1 : Math.max(0, prev.comms.queuedPackets - 1),
          },
          dispatch: { decision, reason, objective: objectiveRef.current, updatedAt: now },
          plan: sc.storm || sc.darkness ? buildPlan(true) : prev.plan,
          alerts: [...newAlerts, ...prev.alerts].slice(0, 8),
          logs: newAlerts.length
            ? [...newAlerts.map((a) => ({ time: a.timestamp, text: a.message, severity: a.severity })), ...prev.logs].slice(0, 40)
            : prev.logs,
          history,
        };
      });
    };

    tick();
    const interval = setInterval(tick, 3500);
    return () => clearInterval(interval);
  }, []);

  const value = useMemo<Ctx>(
    () => ({ data, live, setLive, scenarios, toggleScenario, resetScenarios, objective, setObjective, overrides, setOverride }),
    [data, live, scenarios, toggleScenario, resetScenarios, objective, overrides, setOverride],
  );

  return <PolarGridContext.Provider value={value}>{children}</PolarGridContext.Provider>;
}

export function usePolarGrid() {
  const ctx = useContext(PolarGridContext);
  if (!ctx) throw new Error("usePolarGrid must be used inside PolarGridProvider");
  return ctx;
}
