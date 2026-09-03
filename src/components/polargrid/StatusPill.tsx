import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "critical" | "info" | "muted";

const toneClass: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/35",
  warning: "bg-warning/12 text-warning border-warning/35",
  critical: "bg-destructive/15 text-destructive border-destructive/40",
  info: "bg-info/12 text-info border-info/35",
  muted: "bg-muted text-muted-foreground border-border",
};

export function toneForStatus(status: string): Tone {
  const s = status.toLowerCase();
  if (["normal", "online", "good", "running", "charging", "auto"].some((k) => s.includes(k))) return "success";
  if (["standby", "idle", "warning", "degraded", "feathered", "dark", "manual", "balanc"].some((k) => s.includes(k)))
    return "warning";
  if (["offline", "critical", "fail", "lock", "isolat", "fault"].some((k) => s.includes(k))) return "critical";
  return "info";
}

export function StatusPill({
  status,
  tone,
  dot = true,
  className,
}: {
  status: string;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  const t = tone ?? toneForStatus(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider",
        toneClass[t],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full bg-current", t !== "muted" && "pulse-dot")} />}
      {status}
    </span>
  );
}
