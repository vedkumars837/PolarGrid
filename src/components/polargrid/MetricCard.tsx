import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  unit,
  sub,
  icon,
  accent = "text-foreground",
  children,
  className,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  sub?: ReactNode;
  icon?: ReactNode;
  accent?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("panel flex flex-col gap-3 p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="label-caps">{label}</span>
        {icon && <span className={cn("opacity-80", accent)}>{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn("num text-3xl leading-none font-semibold", accent)}>{value}</span>
        {unit && <span className="num text-sm text-muted-foreground">{unit}</span>}
      </div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      {children}
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </header>
  );
}
