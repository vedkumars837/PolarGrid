import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BrainCircuit,
  Gauge,
  LayoutDashboard,
  Radio,
  Settings2,
  Snowflake,
  TrendingUp,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import { usePolarGrid } from "@/lib/polargrid/simulator";
import { StatusPill } from "./StatusPill";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/forecasting", label: "Forecasting", icon: TrendingUp },
  { to: "/dispatch", label: "AI Dispatch", icon: BrainCircuit },
  { to: "/sources", label: "Energy Sources", icon: Activity },
  { to: "/kpis", label: "KPIs & Sustainability", icon: Gauge },
  { to: "/equipment", label: "Equipment Health", icon: Wrench },
  { to: "/communications", label: "Communications", icon: Radio },
  { to: "/settings", label: "Scenario Simulator", icon: Settings2 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { data, live } = usePolarGrid();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">
            <Snowflake className="size-5" />
          </span>
          <div>
            <p className="leading-tight font-semibold tracking-tight">PolarGrid AI</p>
            <p className="label-caps">Smart EMS</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {nav.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 text-[11px] text-muted-foreground">
          <p className="num">{live ? "LIVE TELEMETRY" : "SIMULATED TELEMETRY"}</p>
          <p className="num">3.5 s refresh · v0.9 demo</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/85 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <Snowflake className="size-5 text-primary md:hidden" />
            <div>
              <p className="text-sm font-semibold">{data.station.name}</p>
              <p className="num text-[11px] text-muted-foreground">
                {new Date(data.timestamp).toUTCString().slice(5, 25)} UTC
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={`Sat ${data.station.connectivity}`} />
            <StatusPill status={`Mode ${data.station.mode}`} />
            <StatusPill status={live ? "Live data" : "Simulated"} tone={live ? "success" : "info"} />
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-1.5 text-xs whitespace-nowrap text-muted-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
