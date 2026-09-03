import { createFileRoute } from "@tanstack/react-router";
import { Battery, Fuel, Leaf, Thermometer, Zap } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertsPanel } from "@/components/polargrid/AlertsPanel";
import { MetricCard } from "@/components/polargrid/MetricCard";
import { PowerFlowDiagram } from "@/components/polargrid/PowerFlowDiagram";
import { StatusPill } from "@/components/polargrid/StatusPill";
import { usePolarGrid } from "@/lib/polargrid/simulator";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Station Overview — PolarGrid AI" },
      {
        name: "description",
        content:
          "Real-time power flow, battery state of charge, renewable fraction and active alerts for a polar research station.",
      },
      { property: "og:title", content: "Station Overview — PolarGrid AI" },
      {
        property: "og:description",
        content: "Live control-room overview of polar station energy generation, storage and load.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { data } = usePolarGrid();
  const s = data.sources;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Renewable Fraction"
          value={Math.round(data.kpis.renewableFraction_pct)}
          unit="%"
          accent="text-success"
          icon={<Leaf className="size-4" />}
          sub="rolling average of load served by renewables"
        />
        <MetricCard
          label="Battery SOC"
          value={s.battery.soc_pct}
          unit="%"
          accent={s.battery.soc_pct < 25 ? "text-destructive" : "text-battery"}
          icon={<Battery className="size-4" />}
          sub={
            <span className="flex items-center gap-2">
              <StatusPill status={s.battery.status} /> {s.battery.chargeRate_kW} kW
            </span>
          }
        />
        <MetricCard
          label="Station Load"
          value={data.load.current_kW}
          unit="kW"
          accent="text-primary"
          icon={<Zap className="size-4" />}
          sub={`bus supply ${(s.solar.output_kW + s.wind.output_kW + s.diesel.output_kW + s.fuelCell.output_kW).toFixed(1)} kW`}
        />
        <MetricCard
          label="Diesel Generator"
          value={s.diesel.output_kW}
          unit="kW"
          accent={s.diesel.output_kW > 1 ? "text-diesel" : "text-muted-foreground"}
          icon={<Fuel className="size-4" />}
          sub={
            <span className="flex items-center gap-2">
              <StatusPill status={s.diesel.status} /> fuel {s.diesel.fuelLevel_pct}%
            </span>
          }
        />
        <MetricCard
          label="Outdoor Conditions"
          value={data.station.outdoorTemp_C}
          unit="°C"
          accent="text-info"
          icon={<Thermometer className="size-4" />}
          sub={`wind ${data.station.windSpeed_ms} m/s · ${data.station.connectivity} link`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <PowerFlowDiagram />
        <AlertsPanel className="max-h-[520px]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-4">
          <span className="label-caps">Generation mix — last 30 samples</span>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.history} margin={{ top: 16, right: 8, left: -22, bottom: 0 }}>
              <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="solar_kW" stackId="1" stroke="var(--solar)" fill="var(--solar)" fillOpacity={0.35} />
              <Area type="monotone" dataKey="wind_kW" stackId="1" stroke="var(--wind)" fill="var(--wind)" fillOpacity={0.3} />
              <Area type="monotone" dataKey="diesel_kW" stackId="1" stroke="var(--diesel)" fill="var(--diesel)" fillOpacity={0.35} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="panel p-4">
          <span className="label-caps">Current AI decision</span>
          <p className="mt-3 text-lg leading-snug font-medium text-foreground">{data.dispatch.decision}</p>
          <p className="mt-2 text-sm text-muted-foreground">{data.dispatch.reason}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill status={`Objective: ${data.dispatch.objective}`} tone="info" dot={false} />
            <StatusPill status={`Mode ${data.station.mode}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
