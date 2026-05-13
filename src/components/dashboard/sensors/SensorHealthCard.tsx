interface SensorHealthCardProps {
  icon: string;
  name: string;
  hasError: boolean;
}

/** Sensor health card */
function SensorHealthCard({ icon, name, hasError }: SensorHealthCardProps) {
  return (
    <div className={`sns-card ${hasError ? "sns-card-err" : ""}`}>
      <div className={`sns-ico ${hasError ? "sns-ico-err" : "sns-ico-ok"}`}>{icon}</div>
      <div>
        <div className="sns-name">{name}</div>
        <div className={`sns-status ${hasError ? "sns-status-err" : ""}`}>
          {hasError ? "⚠ Malfunction — check wiring" : "✓ Operating normally"}
        </div>
      </div>
    </div>
  );
}

export default SensorHealthCard;
