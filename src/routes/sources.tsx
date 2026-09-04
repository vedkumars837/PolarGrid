import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/polargrid/MetricCard";
import { StatusPill } from "@/components/polargrid/StatusPill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { usePolarGrid } from "@/lib/polargrid/simulator";

export const Route = createFileRoute("/sources")({
  head: () => ({
    meta: [
      { title: "Energy Sources — PolarGrid AI" },
      {
        name: "description",
        content: "Per-source detail for solar, wind, diesel, battery and fuel cell assets at the polar station.",
      },
      { property: "og:title", content: "Energy Sources — PolarGrid AI" },
      { property: "og:description", content: "Output, health and maintenance status for every generation asset." },
    ],
  }),
  component: Sources,
});

function Trend({ dataKey, color, rows }: { dataKey: string; color: string; rows: object[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={rows} margin={{ top: 16, right: 8, left: -22, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
        <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
        <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.25} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="num">{value}</span>
    </div>
  );
}

function Sources() {
  const { data } = usePolarGrid();
  const s = data.sources;

  return (
    <div>
      <PageHeader title="Energy Sources" description="Asset-level output, condition and maintenance status." />
      <Tabs defaultValue="solar">
        <TabsList>
          <TabsTrigger value="solar">Solar</TabsTrigger>
          <TabsTrigger value="wind">Wind</TabsTrigger>
          <TabsTrigger value="diesel">Diesel</TabsTrigger>
          <TabsTrigger value="battery">Battery</TabsTrigger>
          <TabsTrigger value="fuelcell">Fuel Cell</TabsTrigger>
        </TabsList>

        <TabsContent value="solar" className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="panel p-4">
            <span className="label-caps">Solar array output (kW)</span>
            <Trend dataKey="solar_kW" color="var(--solar)" rows={data.history} />
          </div>
          <div className="panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="label-caps">Solar PV — PV-A</span>
              <StatusPill status={s.solar.status} />
            </div>
            <Row label="Current output" value={`${s.solar.output_kW} kW`} />
            <Row label="Rated capacity" value={`${s.solar.capacity_kW} kW`} />
            <Row label="Soiling loss" value="3.2 %" />
            <Row label="Last serviced" value="2026-08-01" />
            <Row label="Next maintenance" value="2027-02-01" />
          </div>
        </TabsContent>

        <TabsContent value="wind" className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="panel p-4">
            <span className="label-caps">Wind farm output (kW)</span>
            <Trend dataKey="wind_kW" color="var(--wind)" rows={data.history} />
          </div>
          <div className="panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="label-caps">Turbines WT-01…03</span>
              <StatusPill status={s.wind.status} />
            </div>
            <Row label="Current output" value={`${s.wind.output_kW} kW`} />
            <Row label="Rated capacity" value={`${s.wind.capacity_kW} kW`} />
            <Row label="Wind speed" value={`${data.station.windSpeed_ms} m/s`} />
            <Row label="Icing risk" value={data.station.outdoorTemp_C > -20 ? "Elevated" : "Low"} />
            <Row label="Next maintenance" value="2026-09-20" />
          </div>
        </TabsContent>

        <TabsContent value="diesel" className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="panel p-4">
            <span className="label-caps">Diesel output (kW)</span>
            <Trend dataKey="diesel_kW" color="var(--diesel)" rows={data.history} />
          </div>
          <div className="panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="label-caps">Generator DG-01</span>
              <StatusPill status={s.diesel.status} />
            </div>
            <Row label="Current output" value={`${s.diesel.output_kW} kW`} />
            <Row label="Load factor" value={`${Math.round((s.diesel.output_kW / s.diesel.capacity_kW) * 100)} %`} />
            <div className="mt-3">
              <p className="label-caps mb-1">Fuel level</p>
              <Progress value={s.diesel.fuelLevel_pct} />
              <p className="num mt-1 text-xs text-muted-foreground">{s.diesel.fuelLevel_pct}% of 12,000 L</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="battery" className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="panel p-4">
            <span className="label-caps">State of charge (%)</span>
            <Trend dataKey="soc_pct" color="var(--battery)" rows={data.history} />
          </div>
          <div className="panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="label-caps">Battery bank BAT-01</span>
              <StatusPill status={s.battery.status} />
            </div>
            <Row label="State of charge" value={`${s.battery.soc_pct} %`} />
            <Row label="Charge / discharge" value={`${s.battery.chargeRate_kW} kW`} />
            <Row label="Cell temperature" value={`${s.battery.temp_C} °C`} />
            <Row label="Usable capacity" value="180 kWh" />
            <Row label="Last serviced" value="2026-05-15" />
          </div>
        </TabsContent>

        <TabsContent value="fuelcell" className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="panel p-4">
            <span className="label-caps">Station load served (kW)</span>
            <Trend dataKey="load_kW" color="var(--fuelcell)" rows={data.history} />
          </div>
          <div className="panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="label-caps">Fuel cell FC-01</span>
              <StatusPill status={s.fuelCell.status} />
            </div>
            <Row label="Current output" value={`${s.fuelCell.output_kW} kW`} />
            <div className="mt-3">
              <p className="label-caps mb-1">H₂ storage</p>
              <Progress value={s.fuelCell.h2Level_pct} />
              <p className="num mt-1 text-xs text-muted-foreground">{s.fuelCell.h2Level_pct}% of tank</p>
            </div>
            <Row label="Stack efficiency" value="54 %" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
