interface LiveSensorCardProps {
  label: string;
  icon: string;
  value: string | null | undefined;
  unit: string;
  hasError: boolean;
  fillPct?: string;
  fillColor?: string;
}

/** Temp / Humidity / Lux sensor reading card */
function LiveSensorCard({
  label,
  icon,
  value,
  unit,
  hasError,
  fillPct,
  fillColor,
}: LiveSensorCardProps) {
  return (
    <div className="card">
      <div className="clabel">
        {icon} {label}
      </div>
      {hasError ? (
        <div className="snsr-err">Sensor Error</div>
      ) : (
        <>
          <div className="snsr-val" style={{ color: fillColor ?? "var(--accent)" }}>
            {value ?? "—"}
            <span className="snsr-unit">{unit}</span>
          </div>
          {fillPct !== undefined && (
            <div className="snsr-bar">
              <div
                className="snsr-fill"
                style={{
                  width: fillPct,
                  background: fillColor ?? "var(--accent)",
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default LiveSensorCard;
