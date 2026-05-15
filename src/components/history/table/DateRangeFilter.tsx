/**
 * Date/time range filter with quick preset buttons.
 * Emits { startTime, endTime } as ISO strings.
 *
 * Props:
 *   startTime  – ISO string (controlled)
 *   endTime    – ISO string (controlled)
 *   onChange   – ({ startTime, endTime }) => void
 */

// datetime-local input requires "YYYY-MM-DDTHH:mm" format
const toInputVal = (iso?: string) => (iso ? iso.slice(0, 16) : "");
const fromInput = (v?: string) => (v ? new Date(v).toISOString() : "");

const PRESETS = [
  { label: "1 h", ms: 1 * 3600 * 1000 },
  { label: "24 h", ms: 24 * 3600 * 1000 },
  { label: "7 d", ms: 7 * 86400 * 1000 },
  { label: "30 d", ms: 30 * 86400 * 1000 },
];

export function DateRangeFilter({
  startTime,
  endTime,
  onChange,
}: {
  startTime?: string;
  endTime?: string;
  onChange: (range: { startTime?: string; endTime?: string }) => void;
}) {
  const applyPreset = (ms: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - ms);
    onChange({ startTime: start.toISOString(), endTime: end.toISOString() });
  };

  return (
    <div className="drf-wrap">
      {/* Preset buttons */}
      <div className="drf-presets">
        {PRESETS.map((p) => (
          <button
            type={"button"}
            key={p.label}
            className="drf-preset-btn"
            onClick={() => applyPreset(p.ms)}
          >
            Last {p.label}
          </button>
        ))}
      </div>

      {/* Custom range inputs */}
      <div className="drf-inputs">
        <div className="drf-field">
          <label className="drf-label" htmlFor="start-time-input">
            From
          </label>
          <input
            id="start-time-input"
            type="datetime-local"
            className="drf-input"
            value={toInputVal(startTime)}
            onChange={(e) => onChange({ startTime: fromInput(e.target.value), endTime })}
          />
        </div>
        <span className="drf-sep">→</span>
        <div className="drf-field">
          <label className="drf-label" htmlFor="end-time-input">
            To
          </label>
          <input
            id="end-time-input"
            type="datetime-local"
            className="drf-input"
            value={toInputVal(endTime)}
            onChange={(e) => onChange({ startTime, endTime: fromInput(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}
