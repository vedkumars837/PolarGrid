import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/polargrid/MetricCard";
import { StatusPill } from "@/components/polargrid/StatusPill";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { usePolarGrid, type OverrideKey } from "@/lib/polargrid/simulator";

export const Route = createFileRoute("/dispatch")({
  head: () => ({
    meta: [
      { title: "AI Dispatch — PolarGrid AI" },
      {
        name: "description",
        content: "Current AI dispatch decision, 24-hour planned dispatch schedule and manual override controls.",
      },
      { property: "og:title", content: "AI Dispatch — PolarGrid AI" },
      { property: "og:description", content: "See what the energy optimizer is doing right now and why." },
    ],
  }),
  component: Dispatch,
});

const objectives = ["Minimize fuel burn", "Maximize reliability", "Balanced", "Extend battery life"];

const sources: { key: OverrideKey; label: string; color: string }[] = [
  { key: "solar", label: "Solar PV", color: "var(--solar)" },
  { key: "wind", label: "Wind", color: "var(--wind)" },
  { key: "battery", label: "Battery", color: "var(--battery)" },
  { key: "fuelCell", label: "Fuel Cell", color: "var(--fuelcell)" },
  { key: "diesel", label: "Diesel", color: "var(--diesel)" },
];

function Dispatch() {
  const { data, objective, setObjective, overrides, setOverride } = usePolarGrid();
  const [pending, setPending] = useState<OverrideKey | null>(null);

  return (
    <div>
      <PageHeader
        title="AI Dispatch & Optimization"
        description="Closed-loop optimizer output: the live decision, its rationale, and the planned schedule for the next 24 hours."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <BrainCircuit className="size-4 text-primary" />
            <span className="label-caps">Current dispatch decision</span>
          </div>
          <p className="mt-3 text-2xl leading-snug font-semibold">{data.dispatch.decision}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{data.dispatch.reason}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill status={`Mode ${data.station.mode}`} />
            <StatusPill status={`Objective: ${objective}`} tone="info" dot={false} />
            <StatusPill
              status={`Updated ${new Date(data.dispatch.updatedAt).toUTCString().slice(17, 25)}`}
              tone="muted"
              dot={false}
            />
          </div>
        </div>

        <div className="panel p-5">
          <span className="label-caps">Optimization objective</span>
          <div className="mt-3 flex flex-col gap-2">
            {objectives.map((o) => (
              <button
                key={o}
                onClick={() => setObjective(o)}
                className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  objective === o
                    ? "border-primary/50 bg-primary/12 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="panel mt-4 p-4">
        <span className="label-caps">Planned dispatch — next 24 hours (kW by source)</span>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.plan} margin={{ top: 16, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="solar_kW" name="Solar" stackId="1" stroke="var(--solar)" fill="var(--solar)" fillOpacity={0.4} isAnimationActive={false} />
            <Area type="monotone" dataKey="wind_kW" name="Wind" stackId="1" stroke="var(--wind)" fill="var(--wind)" fillOpacity={0.35} isAnimationActive={false} />
            <Area type="monotone" dataKey="battery_kW" name="Battery" stackId="1" stroke="var(--battery)" fill="var(--battery)" fillOpacity={0.35} isAnimationActive={false} />
            <Area type="monotone" dataKey="fuelCell_kW" name="Fuel cell" stackId="1" stroke="var(--fuelcell)" fill="var(--fuelcell)" fillOpacity={0.35} isAnimationActive={false} />
            <Area type="monotone" dataKey="diesel_kW" name="Diesel" stackId="1" stroke="var(--diesel)" fill="var(--diesel)" fillOpacity={0.4} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="panel mt-4 p-5">
        <span className="label-caps">Manual override — source availability</span>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {sources.map((s) => (
            <div key={s.key} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium" style={{ color: s.color }}>
                  {s.label}
                </p>
                <p className="num text-[11px] text-muted-foreground">
                  {overrides[s.key] ? "Available to optimizer" : "Locked out"}
                </p>
              </div>
              <Switch
                checked={overrides[s.key]}
                onCheckedChange={(next) => (next ? setOverride(s.key, true) : setPending(s.key))}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Removing a source requires confirmation; the optimizer immediately re-plans around the remaining assets.
        </p>
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lock out this source?</AlertDialogTitle>
            <AlertDialogDescription>
              The optimizer will drop it from the dispatch plan immediately. On a live station this may force a diesel
              start or load shedding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) setOverride(pending, false);
                setPending(null);
              }}
            >
              Lock out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
