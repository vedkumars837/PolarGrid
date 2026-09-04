import { createFileRoute } from "@tanstack/react-router";
import { Radio, ShieldCheck, Upload } from "lucide-react";
import { MetricCard, PageHeader } from "@/components/polargrid/MetricCard";
import { StatusPill } from "@/components/polargrid/StatusPill";
import { usePolarGrid } from "@/lib/polargrid/simulator";

export const Route = createFileRoute("/communications")({
  head: () => ({
    meta: [
      { title: "Communications — PolarGrid AI" },
      {
        name: "description",
        content: "Satellite link status, DTN sync queue, event log and cybersecurity posture for the station EMS.",
      },
      { property: "og:title", content: "Communications — PolarGrid AI" },
      { property: "og:description", content: "Connectivity and system status for the polar station controller." },
    ],
  }),
  component: Communications,
});

function Communications() {
  const { data } = usePolarGrid();
  const c = data.comms;

  return (
    <div>
      <PageHeader
        title="Communications & System Status"
        description="The station keeps optimizing locally when the satellite link drops; data is queued and synced later."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Satellite link"
          value={c.satellite}
          accent={c.satellite === "Online" ? "text-success" : c.satellite === "Degraded" ? "text-warning" : "text-destructive"}
          icon={<Radio className="size-4" />}
          sub={<StatusPill status={c.satellite} />}
        />
        <MetricCard label="Bandwidth" value={c.bandwidth_kbps} unit="kbps" accent="text-info" sub="uplink allocation" />
        <MetricCard
          label="DTN queue"
          value={c.queuedPackets}
          unit="pkts"
          accent={c.queuedPackets > 10 ? "text-warning" : "text-foreground"}
          icon={<Upload className="size-4" />}
          sub={`last sync ${new Date(c.lastSync).toUTCString().slice(17, 25)} UTC`}
        />
        <MetricCard
          label="Cybersecurity"
          value="Nominal"
          accent="text-success"
          icon={<ShieldCheck className="size-4" />}
          sub={c.security + " · IDS active"}
        />
      </div>

      <div className="panel mt-4 p-4">
        <span className="label-caps">System event log</span>
        <ul className="mt-3 space-y-1.5">
          {data.logs.map((l, i) => (
            <li key={i} className="num flex gap-3 border-b border-border py-1.5 text-xs last:border-0">
              <span className="text-muted-foreground">{new Date(l.time).toUTCString().slice(17, 25)}</span>
              <span
                className={
                  l.severity === "critical" ? "text-destructive" : l.severity === "warning" ? "text-warning" : "text-info"
                }
              >
                [{l.severity.toUpperCase()}]
              </span>
              <span className="text-foreground">{l.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
