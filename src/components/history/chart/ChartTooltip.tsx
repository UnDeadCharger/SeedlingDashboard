type ChartTooltipProps = {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    dataKey: string;
    color: string;
  }[];
  label?: string;
  pctMode?: boolean;
};

function ChartTooltip({ active, payload, label, pctMode }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--surf2)",
        border: "1px solid var(--bdr-hi)",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: "0.76rem",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          color: "var(--text-s)",
          marginBottom: 7,
          fontSize: "0.68rem",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          style={{
            color: p.color,
            marginBottom: 3,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span
            style={{
              width: 10,
              height: 2,
              background: p.color,
              display: "inline-block",
              borderRadius: 1,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "var(--text-s)" }}>{p.name}:</span>
          <strong>
            {pctMode
              ? `${Math.round(p.value * 100)}%`
              : typeof p.value === "number"
                ? p.value.toFixed(1)
                : p.value}
          </strong>
        </div>
      ))}
    </div>
  );
}

export default ChartTooltip;
