import { createFileRoute } from "@tanstack/react-router";
import { BatteryWarning, CloudLightning, MoonStar, RotateCcw, SatelliteDish } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/polargrid/MetricCard";
import { StatusPill } from "@/components/polargrid/StatusPill";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usePolarGrid } from "@/lib/polargrid/simulator";
import type { ScenarioId } from "@/lib/polargrid/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Scenario Simulator — PolarGrid AI" },
      {
        name: "description",
        content: "Inject storm, comms outage, battery depletion and polar darkness scenarios to demo EMS decision-making.",
      },
      { property: "og:title", content: "Scenario Simulator — PolarGrid AI" },
      { property: "og:description", content: "Drive the dashboard live with injected polar station scenarios." },
    ],
  }),
  component: SettingsPage,
});

const scenarioDefs: { id: ScenarioId; title: string; body: string; icon: typeof CloudLightning }[] = [
  {
    id: "storm",
    title: "Simulate Storm",
    body: "Turbines feather above cut-out, irradiance collapses, diesel spins up and the link degrades.",
    icon: CloudLightning,
  },
  {
    id: "outage",
    title: "Simulate Comms Outage",
    body: "Satellite link drops, EMS enters fail-safe and DTN packets start queueing.",
    icon: SatelliteDish,
  },
  {
    id: "batteryLow",
    title: "Simulate Battery Low",
    body: "Bank falls below the reserve floor; diesel comes online to recharge and carry load.",
    icon: BatteryWarning,
  },
  {
    id: "darkness",
    title: "Simulate Winter Darkness",
    body: "Solar generation goes to zero for the polar night; dispatch leans on wind and storage.",
    icon: MoonStar,
  },
];

function SettingsPage() {
  const { scenarios, toggleScenario, resetScenarios, live, setLive, data } = usePolarGrid();

  return (
    <div>
      <PageHeader
        title="Settings & Scenario Simulator"
        description="Inject conditions and watch the Overview, Dispatch and Comms pages react within one refresh cycle."
      />

      <div className="panel mb-4 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-medium">Data source</p>
          <p className="text-sm text-muted-foreground">
            Live station telemetry is unavailable in demo mode; the simulator random-walks every 3.5 s.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={live ? "Live" : "Simulated"} tone={live ? "success" : "info"} />
          <Switch checked={live} onCheckedChange={setLive} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {scenarioDefs.map((s) => {
          const active = scenarios[s.id];
          return (
            <div
              key={s.id}
              className={`panel flex flex-col gap-3 p-5 transition-colors ${active ? "border-warning/50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <s.icon className={`size-4 ${active ? "text-warning" : "text-primary"}`} />
                  {s.title}
                </span>
                {active && <StatusPill status="Injected" tone="warning" />}
              </div>
              <p className="text-sm text-muted-foreground">{s.body}</p>
              <Button
                variant={active ? "secondary" : "default"}
                onClick={() => {
                  toggleScenario(s.id);
                  toast(active ? `${s.title} cleared` : `${s.title} injected`, {
                    description: active ? "Returning to nominal dispatch." : "EMS is re-optimizing dispatch now.",
                  });
                }}
              >
                {active ? "Clear scenario" : "Inject scenario"}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={resetScenarios}>
          <RotateCcw className="size-4" /> Reset all scenarios
        </Button>
        <span className="num text-xs text-muted-foreground">
          Station mode: {data.station.mode} · link {data.station.connectivity}
        </span>
      </div>
    </div>
  );
}
