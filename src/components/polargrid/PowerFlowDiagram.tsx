import { usePolarGrid } from "@/lib/polargrid/simulator";

interface Node {
  key: string;
  label: string;
  value: number;
  detail: string;
  color: string;
  y: number;
  direction: "in" | "out" | "bi";
  reverse?: boolean;
}

const W = 900;
const H = 420;
const SRC_X = 158;
const BUS_X = 470;
const LOAD_X = 790;

export function PowerFlowDiagram() {
  const { data } = usePolarGrid();
  const s = data.sources;
  const charging = s.battery.status === "Charging";

  const nodes: Node[] = [
    {
      key: "solar",
      label: "Solar PV",
      value: s.solar.output_kW,
      detail: `${s.solar.output_kW} kW · ${s.solar.status}`,
      color: "var(--solar)",
      y: 52,
      direction: "in",
    },
    {
      key: "wind",
      label: "Wind",
      value: s.wind.output_kW,
      detail: `${s.wind.output_kW} kW · ${s.wind.status}`,
      color: "var(--wind)",
      y: 137,
      direction: "in",
    },
    {
      key: "diesel",
      label: "Diesel",
      value: s.diesel.output_kW,
      detail: `${s.diesel.output_kW} kW · ${s.diesel.status}`,
      color: "var(--diesel)",
      y: 222,
      direction: "in",
    },
    {
      key: "fuelcell",
      label: "Fuel Cell",
      value: s.fuelCell.output_kW,
      detail: `${s.fuelCell.output_kW} kW · ${s.fuelCell.status}`,
      color: "var(--fuelcell)",
      y: 307,
      direction: "in",
    },
    {
      key: "battery",
      label: "Battery",
      value: s.battery.chargeRate_kW,
      detail: `${s.battery.soc_pct}% · ${s.battery.status}`,
      color: "var(--battery)",
      y: 372,
      direction: "bi",
      reverse: charging,
    },
  ];

  const strokeFor = (v: number) => Math.max(1.4, Math.min(11, 1.4 + (v / 26) * 9));

  return (
    <div className="panel p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="label-caps">Live Power Flow</span>
        <span className="num text-xs text-muted-foreground">
          bus {(s.solar.output_kW + s.wind.output_kW + s.diesel.output_kW + s.fuelCell.output_kW).toFixed(1)} kW in ·{" "}
          {data.load.current_kW} kW out
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Animated station power flow diagram">
        <defs>
          <linearGradient id="busGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {nodes.map((n) => {
          const active = n.value > 0.25;
          const path = `M ${SRC_X + 104} ${n.y + 30} C ${SRC_X + 220} ${n.y + 30}, ${BUS_X - 90} ${H / 2}, ${BUS_X - 22} ${H / 2}`;
          return (
            <g key={n.key}>
              <path d={path} fill="none" stroke="var(--border)" strokeWidth={1.5} />
              {active && (
                <path
                  d={path}
                  fill="none"
                  stroke={n.color}
                  strokeWidth={strokeFor(n.value)}
                  strokeLinecap="round"
                  opacity={0.85}
                  className="flow-dash"
                  style={n.reverse ? { animationDirection: "reverse" } : undefined}
                />
              )}
            </g>
          );
        })}

        {/* bus -> load */}
        <path
          d={`M ${BUS_X + 22} ${H / 2} C ${BUS_X + 120} ${H / 2}, ${LOAD_X - 130} ${H / 2}, ${LOAD_X - 62} ${H / 2}`}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1.5}
        />
        <path
          d={`M ${BUS_X + 22} ${H / 2} C ${BUS_X + 120} ${H / 2}, ${LOAD_X - 130} ${H / 2}, ${LOAD_X - 62} ${H / 2}`}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={strokeFor(data.load.current_kW)}
          strokeLinecap="round"
          className="flow-dash"
          opacity={0.9}
        />

        {nodes.map((n) => (
          <g key={`${n.key}-node`}>
            <rect
              x={SRC_X - 40}
              y={n.y}
              width={144}
              height={60}
              rx={12}
              fill="var(--card)"
              stroke={n.value > 0.25 ? n.color : "var(--border)"}
              strokeWidth={1.5}
            />
            <circle cx={SRC_X - 22} cy={n.y + 30} r={5} fill={n.value > 0.25 ? n.color : "var(--muted-foreground)"} />
            <text x={SRC_X - 6} y={n.y + 25} fill="var(--foreground)" fontSize="14" fontWeight="600">
              {n.label}
            </text>
            <text x={SRC_X - 6} y={n.y + 45} fill="var(--muted-foreground)" fontSize="12" fontFamily="var(--font-mono)">
              {n.detail}
            </text>
          </g>
        ))}

        {/* Bus bar */}
        <rect x={BUS_X - 22} y={70} width={44} height={H - 140} rx={16} fill="url(#busGrad)" opacity={0.25} />
        <rect x={BUS_X - 22} y={70} width={44} height={H - 140} rx={16} fill="none" stroke="var(--primary)" strokeWidth={1.5} />
        <text
          x={BUS_X}
          y={H / 2}
          fill="var(--primary)"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          transform={`rotate(-90 ${BUS_X} ${H / 2})`}
          letterSpacing="3"
        >
          MAIN DC/AC BUS
        </text>

        {/* Load */}
        <rect x={LOAD_X - 62} y={H / 2 - 52} width={150} height={104} rx={14} fill="var(--card)" stroke="var(--primary)" strokeWidth={1.5} />
        <text x={LOAD_X + 13} y={H / 2 - 20} fill="var(--foreground)" fontSize="14" fontWeight="600" textAnchor="middle">
          Station Loads
        </text>
        <text
          x={LOAD_X + 13}
          y={H / 2 + 12}
          fill="var(--primary)"
          fontSize="26"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
        >
          {data.load.current_kW}
        </text>
        <text x={LOAD_X + 13} y={H / 2 + 34} fill="var(--muted-foreground)" fontSize="12" textAnchor="middle">
          kW demand
        </text>
      </svg>
      <p className="mt-1 text-xs text-muted-foreground">
        Line thickness scales with power magnitude. Battery flow reverses direction while charging.
      </p>
    </div>
  );
}
