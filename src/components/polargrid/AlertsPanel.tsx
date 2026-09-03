import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { usePolarGrid } from "@/lib/polargrid/simulator";
import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/polargrid/types";

const cfg: Record<Severity, { icon: typeof Info; cls: string }> = {
  info: { icon: Info, cls: "text-info border-info/30 bg-info/8" },
  warning: { icon: AlertTriangle, cls: "text-warning border-warning/30 bg-warning/8" },
  critical: { icon: ShieldAlert, cls: "text-destructive border-destructive/35 bg-destructive/10" },
};

export function AlertsPanel({ className }: { className?: string }) {
  const { data } = usePolarGrid();
  return (
    <div className={cn("panel flex flex-col p-4", className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="label-caps">Active Alerts</span>
        <span className="num text-xs text-muted-foreground">{data.alerts.length} active</span>
      </div>
      <ul className="flex flex-col gap-2 overflow-y-auto">
        {data.alerts.map((a) => {
          const { icon: Icon, cls } = cfg[a.severity];
          return (
            <li key={a.id} className={cn("flex gap-2.5 rounded-md border p-2.5", cls)}>
              <Icon className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm leading-snug text-foreground">{a.message}</p>
                <p className="num mt-0.5 text-[11px] text-muted-foreground">
                  {new Date(a.timestamp).toUTCString().slice(17, 25)} UTC · {a.severity}
                </p>
              </div>
            </li>
          );
        })}
        {data.alerts.length === 0 && <li className="text-sm text-muted-foreground">No active alerts. All systems nominal.</li>}
      </ul>
    </div>
  );
}
