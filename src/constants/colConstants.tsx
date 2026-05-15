function OnOffPill({ on }: { on: boolean | 0 | 1 }) {
  const active = on === true || on === 1;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 8px",
        borderRadius: 6,
        fontSize: "0.68rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        background: active ? "rgba(61,220,122,0.15)" : "rgba(255,255,255,0.04)",
        color: active ? "var(--accent)" : "var(--text-m)",
        border: `1px solid ${active ? "rgba(61,220,122,0.3)" : "var(--bdr)"}`,
      }}
    >
      {active ? "ON" : "OFF"}
    </span>
  );
}

function WaterTag({ level }: { level: "Under" | "Normal" | "Over" }) {
  const theme = {
    Under: ["#ff5252", "rgba(255,82,82,0.13)"],
    Normal: ["#3ddc7a", "rgba(61,220,122,0.1)"],
    Over: ["#4fc3f7", "rgba(79,195,247,0.1)"],
  };
  const [color, bg] = theme[level] ?? ["var(--text-m)", "var(--surf3)"];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 8px",
        borderRadius: 6,
        fontSize: "0.68rem",
        fontWeight: 700,
        color,
        background: bg,
        border: `1px solid ${color}44`,
      }}
    >
      {level ?? "—"}
    </span>
  );
}

type ModePillProps = {
  mode: string;
};

type PhasePillProps = {
  phase: string;
};

function ModePill({ mode }: ModePillProps) {
  const color = mode === "auto" ? "var(--accent)" : "var(--blue)";
  return <span style={{ fontSize: "0.72rem", color, fontWeight: 600 }}>{mode}</span>;
}

function PhasePill({ phase }: PhasePillProps) {
  const color =
    phase === "germination"
      ? "var(--amber)"
      : phase === "nursery"
        ? "var(--accent)"
        : "var(--text-s)";
  return <span style={{ fontSize: "0.72rem", color, fontWeight: 600 }}>{phase}</span>;
}

/** Visible table columns (subset of CSV_FIELDS for readability) */
export const TABLE_COLS: {
  key: string;
  label: string;
  sortable: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  render?: (value: any) => React.ReactNode;
}[] = [
  {
    key: "receivedAt",
    label: "receivedAt",
    sortable: true,
    render: (v: string | number | Date) =>
      new Date(v).toLocaleString("en-GB", {
        dateStyle: "short",
        timeStyle: "medium",
      }),
  },
  {
    key: "tempLvl",
    label: "Temp (°C)",
    sortable: true,
    render: (v: number | null) => (v != null ? v.toFixed(1) : "—"),
  },
  {
    key: "moistureLvl",
    label: "Humid (%)",
    sortable: true,
    render: (v: number | null) => (v != null ? v.toFixed(1) : "—"),
  },
  {
    key: "luxLvl",
    label: "Lux",
    sortable: true,
    render: (v: number | null) => (v != null ? v.toLocaleString() : "—"),
  },
  {
    key: "waterLvl",
    label: "Water",
    sortable: false,
    render: (v: "Under" | "Normal" | "Over") => (
      <WaterTag level={v.trim() as "Under" | "Normal" | "Over"} />
    ),
  },
  {
    key: "isLightOn",
    label: "Light",
    sortable: false,
    render: (v: boolean | 0 | 1) => <OnOffPill on={v} />,
  },
  {
    key: "isFanOn",
    label: "Fan",
    sortable: false,
    render: (v: boolean | 0 | 1) => <OnOffPill on={v} />,
  },
  {
    key: "isMistingOn",
    label: "Mist",
    sortable: false,
    render: (v: boolean | 0 | 1) => <OnOffPill on={v} />,
  },
  {
    key: "mode",
    label: "Mode",
    sortable: false,
    render: (v: string) => <ModePill mode={v} />,
  },
  {
    key: "phase",
    label: "Phase",
    sortable: false,
    render: (v: string) => <PhasePill phase={v} />,
  },
];
