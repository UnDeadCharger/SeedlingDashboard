import { WATER_THEME } from "@/constants";
import { normalizeWater } from "@/utils/formatters";

interface WaterCardProps {
  waterLvl: string;
  waterLvlAlarm: boolean;
  waterRawADC: number;
}

/** Water level card */
function WaterCard({ waterLvl, waterLvlAlarm, waterRawADC }: WaterCardProps) {
  const wl = normalizeWater(waterLvl);
  const th = WATER_THEME[wl] ?? WATER_THEME.Normal;
  return (
    <div className="card">
      <div className="clabel">💧 Water Level</div>
      <div className="w-main" style={{ color: th.color }}>
        {wl}
      </div>
      <div className="w-bar">
        <div className="w-fill" style={{ width: th.fill, background: th.color }} />
      </div>
      <div className="w-adc">Raw ADC: {waterRawADC}</div>
      {waterLvlAlarm && <div className="atag">⚠ Low Water Alarm</div>}
    </div>
  );
}

export default WaterCard;
