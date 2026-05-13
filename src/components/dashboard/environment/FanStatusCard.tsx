import { getFanContext } from "@/utils";

import NightCycleBar from "./NightCycleBar";

import type { SeedlingData } from "@/types";
interface FanStatusCardProps {
  data: SeedlingData;
}

/** Fan status card */
function FanStatusCard({ data }: FanStatusCardProps) {
  const ctx = getFanContext(data);
  const { fanCyclePos, isFan2On } = data;
  const showBar = ctx.tag === "night" || ctx.tag === "boost";

  const tagTheme = {
    germ: {
      bg: "rgba(255,255,255,0.05)",
      color: "var(--text-m)",
      border: "var(--bdr)",
    },
    day: {
      bg: "rgba(245,166,35,0.14)",
      color: "var(--amber)",
      border: "rgba(245,166,35,0.4)",
    },
    night: {
      bg: "rgba(79,195,247,0.14)",
      color: "var(--blue)",
      border: "rgba(79,195,247,0.4)",
    },
    boost: {
      bg: "rgba(255,82,82,0.13)",
      color: "var(--alarm)",
      border: "rgba(255,82,82,0.4)",
    },
    manual: {
      bg: "rgba(79,195,247,0.14)",
      color: "var(--blue)",
      border: "rgba(79,195,247,0.4)",
    },
  };
  const tt = tagTheme[ctx.tag as keyof typeof tagTheme] ?? tagTheme.manual;
  const tagIcon = {
    germ: "🌱",
    day: "☀",
    night: "🌙",
    boost: "⚡",
    manual: "⚙",
  }[ctx.tag];

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: "1.6rem", lineHeight: 1 }}>
            {ctx.effectiveOn ? (
              <span className="spin-slow">🌀</span>
            ) : (
              <span style={{ opacity: 0.3 }}>🌀</span>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Ventilation Fans</div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-s)",
                marginTop: 2,
              }}
            >
              Fan 1: {ctx.effectiveOn ? "ON" : "OFF"} · Fan 2: {isFan2On ? "ON" : "OFF"} (mirror)
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 5,
          }}
        >
          <span className={`spill ${ctx.effectiveOn ? "sp-green" : "sp-off"}`}>
            {ctx.effectiveOn ? "ON" : "OFF"}
          </span>
          <span
            className="fan-tag"
            style={{
              background: tt.bg,
              color: tt.color,
              border: `1px solid ${tt.border}`,
            }}
          >
            {tagIcon} {ctx.label}
          </span>
        </div>
      </div>
      {/* Detail */}
      <div className="fan-detail">{ctx.detail}</div>
      {/* Night cycle bar */}
      {showBar && <NightCycleBar cyclePos={fanCyclePos} effectiveOn={ctx.effectiveOn} />}
    </div>
  );
}

export default FanStatusCard;
