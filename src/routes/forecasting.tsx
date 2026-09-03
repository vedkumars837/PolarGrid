import { createFileRoute } from "@tanstack/react-router";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { MetricCard, PageHeader } from "@/components/polargrid/MetricCard";
import { usePolarGrid } from "@/lib/polargrid/simulator";

export const Route = createFileRoute("/forecasting")({
  head: () => ({
    meta: [
      { title: "Forecasting — PolarGrid AI" },
      {
        name: "description",
        content: "Weather, generation and load forecasts vs. actuals for the next 24 hours at the polar station.",
      },
      { property: "og:title", content: "Forecasting — PolarGrid AI" },
      { property: "og:description", content: "Forecast vs. actual weather, generation and load for the station." },
    ],
  }),
  component: Forecasting,
});

const axis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false } as const;
const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
};

function Chart({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="panel p-4">
      <span className="label-caps">{title}</span>
      <ResponsiveContainer width="100%" height={240}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function Forecasting() {
  const { data } = usePolarGrid();
  const f = data.forecast;

  return (
    <div>
      <PageHeader
        title="Forecasting"
        description="Model outputs for the next 24 hours, overlaid with the last 6 hours of measured actuals."
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Weather model MAE" value="1.4" unit="°C" accent="text-info" sub="24 h rolling, temperature" />
        <MetricCard label="Generation model RMSE" value="2.1" unit="kW" accent="text-info" sub="combined solar + wind" />
        <MetricCard label="Load model MAE" value="0.8" unit="kW" accent="text-info" sub="station demand" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Chart title="Weather forecast">
          <LineChart data={f} margin={{ top: 16, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" {...axis} />
            <YAxis {...axis} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="tempC" name="Temp °C" stroke="var(--info)" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="windSpeed" name="Wind m/s" stroke="var(--wind)" dot={false} strokeWidth={2} />
          </LineChart>
        </Chart>
        <Chart title="Solar irradiance forecast">
          <LineChart data={f} margin={{ top: 16, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" {...axis} />
            <YAxis {...axis} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="irradiance" name="W/m²" stroke="var(--solar)" dot={false} strokeWidth={2} />
          </LineChart>
        </Chart>
        <Chart title="Generation forecast vs. actual">
          <LineChart data={f} margin={{ top: 16, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" {...axis} />
            <YAxis {...axis} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="solar_kW" name="Solar fc" stroke="var(--solar)" dot={false} strokeDasharray="5 4" />
            <Line type="monotone" dataKey="solarActual_kW" name="Solar act" stroke="var(--solar)" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="wind_kW" name="Wind fc" stroke="var(--wind)" dot={false} strokeDasharray="5 4" />
            <Line type="monotone" dataKey="windActual_kW" name="Wind act" stroke="var(--wind)" dot={false} strokeWidth={2} />
          </LineChart>
        </Chart>
        <Chart title="Load forecast vs. actual">
          <LineChart data={f} margin={{ top: 16, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" {...axis} />
            <YAxis {...axis} axisLine={false} domain={[14, 30]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="load_kW" name="Forecast" stroke="var(--primary)" dot={false} strokeDasharray="5 4" />
            <Line type="monotone" dataKey="loadActual_kW" name="Actual" stroke="var(--success)" dot={false} strokeWidth={2} />
          </LineChart>
        </Chart>
      </div>
    </div>
  );
}
