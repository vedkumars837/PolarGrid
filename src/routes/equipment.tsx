import { createFileRoute } from "@tanstack/react-router";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/polargrid/MetricCard";
import { StatusPill } from "@/components/polargrid/StatusPill";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePolarGrid } from "@/lib/polargrid/simulator";

export const Route = createFileRoute("/equipment")({
  head: () => ({
    meta: [
      { title: "Equipment Health — PolarGrid AI" },
      {
        name: "description",
        content: "Predictive maintenance view: asset health, anomaly detection alerts and sensor trends.",
      },
      { property: "og:title", content: "Equipment Health — PolarGrid AI" },
      { property: "og:description", content: "Monitored assets with health status and recommended actions." },
    ],
  }),
  component: Equipment,
});

function Equipment() {
  const { data } = usePolarGrid();

  return (
    <div>
      <PageHeader
        title="Equipment Health & Predictive Maintenance"
        description="Anomaly detection across turbines, generators, storage and fuel cells."
      />
      <div className="panel overflow-x-auto p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Key sensor</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Last serviced</TableHead>
              <TableHead>Next service</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.equipment.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="num font-medium">{e.id}</TableCell>
                <TableCell>{e.type}</TableCell>
                <TableCell>
                  <StatusPill status={e.health} tone={e.health === "Good" ? "success" : e.health === "Warning" ? "warning" : "critical"} />
                </TableCell>
                <TableCell className="text-muted-foreground">{e.metric}</TableCell>
                <TableCell className="num text-right">{e.value}</TableCell>
                <TableCell className="num text-muted-foreground">{e.lastServiced}</TableCell>
                <TableCell className="num text-muted-foreground">{e.nextService}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="panel p-4">
          <span className="label-caps">Anomaly detections</span>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="rounded-md border border-warning/30 bg-warning/8 p-3">
              <p className="font-medium">WT-03 vibration signature drift</p>
              <p className="mt-1 text-muted-foreground">
                Recommended action: inspect blade surfaces for ice accretion; de-rate to 60% until inspected.
              </p>
            </li>
            <li className="rounded-md border border-warning/30 bg-warning/8 p-3">
              <p className="font-medium">BAT-01 cell temperature spread widening</p>
              <p className="mt-1 text-muted-foreground">
                Recommended action: run a balancing cycle at low load and log module temperatures.
              </p>
            </li>
            <li className="rounded-md border border-border p-3">
              <p className="font-medium">DG-01 oil condition nominal</p>
              <p className="mt-1 text-muted-foreground">No action required; next oil sample due at 250 run-hours.</p>
            </li>
          </ul>
        </div>
        <div className="panel p-4">
          <span className="label-caps">Battery cell temperature trend</span>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.history} margin={{ top: 16, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="soc_pct" name="SOC %" stroke="var(--battery)" dot={false} strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="load_kW" name="Load kW" stroke="var(--info)" dot={false} strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
