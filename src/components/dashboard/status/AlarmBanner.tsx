/**
 * Red pulsing alert bar shown whenever any alarm flag is active.
 * Renders nothing when there are no active alarms.
 *
 * Props:
 *   waterLvlAlarm  – boolean
 *   germHumidAlarm – boolean
 *   shtError       – boolean
 *   luxError       – boolean
 *
 * Usage:
 *   <AlarmBanner {...data} />
 */
type AlarmBannerProps = {
  waterLvlAlarm: boolean;
  germHumidAlarm: boolean;
  shtError: boolean;
  luxError: boolean;
};

export function AlarmBanner({
  waterLvlAlarm,
  germHumidAlarm,
  shtError,
  luxError,
}: AlarmBannerProps) {
  const items = [
    waterLvlAlarm && "💧 Water Level Low",
    germHumidAlarm && "💨 Humidity Low (Germination)",
    shtError && "🌡 SHT Sensor Error",
    luxError && "☀ Lux Sensor Error",
  ].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="alarm-bar">
      <span style={{ fontSize: "1.25rem" }}>⚠️</span>
      <div className="alarm-bar-txt">
        <strong>Active Alerts: </strong>
        {items.join(" · ")}
      </div>
    </div>
  );
}
