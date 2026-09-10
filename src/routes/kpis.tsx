import { createFileRoute } from "@tanstack/react-router";
import { CloudOff, DollarSign, Fuel, Timer } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MetricCard, PageHeader } from "@/components/polargrid/MetricCard";
import { usePolarGrid } from "@/lib/polargrid/simulator";

export const Route = createFileRoute("/kpis")({
  head: () => ({
    meta: [
      { title: "KPIs & Sustainability — PolarGrid AI" },
      {
        name: "description",
        content: "Renewable utilization, diesel consumption trend, CO2 avoided and station uptime for the polar station.",
      },
      { property: "og:title", content: "KPIs & Sustainability — PolarGrid AI" },
      { property: "og:description", content: "Sustainability impact and reliability metrics for the AI-run microgrid." },
    ],
  }),
  component: Kpis,
});

function Gauge({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="panel flex flex-col items-center p-4">
      <span className="label-caps self-start">{label}</span>
      <ResponsiveContainer width="100%" height={190}>
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          data={[{ name: label, value }]}
          startAngle={220}
          endAngle={-40}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: "var(--muted)" }} dataKey="value" cornerRadius={12} fill={color} />
        </RadialBarChart>
      </ResponsiveContainer>
      <p className="num -mt-14 mb-6 text-3xl font-semibold" style={{ color }}>
        {value.toFixed(1)}%
      </p>
    </div>
  );
}

function Kpis() {
  const { data } = usePolarGrid();
  const k = data.kpis;
  const dieselTrend = data.history.map((h, i) => ({
    time: h.time,
    diesel_L: Number((k.dieselUsed_L_ytd - (data.history.length - i) * 1.4).toFixed(1)),
  }));

  return (
    <div>
      <PageHeader
        title="KPIs & Sustainability"
        description="Year-to-date impact of AI dispatch versus the station's baseline diesel-first operation."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Gauge value={k.renewableFraction_pct} label="Renewable utilization" color="var(--success)" />
        <Gauge value={data.sources.battery.soc_pct} label="Battery state of charge" color="var(--battery)" />
        <Gauge value={k.uptime_pct} label="Station uptime" color="var(--primary)" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="CO₂ avoided (YTD)"
          value={k.co2Avoided_tons_ytd.toFixed(2)}
          unit="t"
          accent="text-success"
          icon={<CloudOff className="size-4" />}
          sub={`≈ ${Math.round(k.co2Avoided_tons_ytd / 4.6)} cars taken off the road for a year`}
        />
        <MetricCard
          label="Diesel used (YTD)"
          value={Math.round(k.dieselUsed_L_ytd)}
          unit="L"
          accent="text-diesel"
          icon={<Fuel className="size-4" />}
          sub="baseline projection was 11,800 L"
        />
        <MetricCard
          label="Cost savings (YTD)"
          value={`$${(k.costSaved_usd_ytd / 1000).toFixed(1)}k`}
          accent="text-warning"
          icon={<DollarSign className="size-4" />}
          sub="delivered fuel at $4.10/L equivalent"
        />
        <MetricCard
          label="Reliability"
          value={k.uptime_pct.toFixed(2)}
          unit="%"
          accent="text-primary"
          icon={<Timer className="size-4" />}
          sub="critical-load availability, rolling 12 months"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="panel p-4">
          <span className="label-caps">Cumulative diesel consumption</span>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dieselTrend} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="diesel_L" stroke="var(--diesel)" fill="var(--diesel)" fillOpacity={0.25} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="panel p-4">
          <span className="label-caps">Renewable fraction trend</span>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.history} margin={{ top: 16, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="renewable_pct" stroke="var(--success)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
