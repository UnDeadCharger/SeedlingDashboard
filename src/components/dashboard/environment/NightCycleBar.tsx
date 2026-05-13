import { FAN_CYCLE_MIN, FAN_NIGHT_ON_MIN } from "@/constants";

interface NightCycleBarProps {
  cyclePos: number;
  effectiveOn: boolean;
}

/** Night cycle 20-segment bar */
function NightCycleBar({ cyclePos, effectiveOn }: NightCycleBarProps) {
  const timeUntilChange = effectiveOn
    ? `${FAN_NIGHT_ON_MIN - cyclePos} min until OFF`
    : `${FAN_CYCLE_MIN - cyclePos} min until ON`;
  return (
    <div>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 7 }}>
        {Array.from({ length: FAN_CYCLE_MIN }, (_, i) => (
          <div
            key={`nc-${
              // biome-ignore lint/suspicious/noArrayIndexKey: shouldn't overlap
              i
            }`}
            style={{
              width: 13,
              height: 22,
              borderRadius: 4,
              transition: "all 0.3s",
              background:
                i === cyclePos
                  ? i < FAN_NIGHT_ON_MIN
                    ? "var(--accent)"
                    : "var(--alarm)"
                  : i < FAN_NIGHT_ON_MIN
                    ? "rgba(61,220,122,0.28)"
                    : "rgba(255,255,255,0.05)",
              border: i === cyclePos ? "none" : "1px solid rgba(255,255,255,0.04)",
              boxShadow:
                i === cyclePos
                  ? i < FAN_NIGHT_ON_MIN
                    ? "0 0 8px var(--accent)"
                    : "0 0 8px var(--alarm)"
                  : "none",
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontSize: "0.68rem",
          color: "var(--text-s)",
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontFamily: "'Courier Prime', monospace" }}>
          Pos {cyclePos}/{FAN_CYCLE_MIN - 1}
        </span>
        <span style={{ color: effectiveOn ? "var(--accent)" : "var(--alarm)" }}>
          {timeUntilChange}
        </span>
        <span style={{ color: "var(--text-m)" }}>
          {[
            ["rgba(61,220,122,0.28)", "ON"],
            ["rgba(255,255,255,0.05)", "OFF"],
            ["var(--accent)", "Now"],
          ].map(([bg, lbl]) => (
            <span key={lbl} style={{ marginRight: 10 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: bg,
                  marginRight: 3,
                  verticalAlign: "middle",
                }}
              />
              {lbl}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

export default NightCycleBar;
