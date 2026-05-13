import { fmtCountdown, pad } from "@/utils/formatters";

interface CountdownCardProps {
  phase: "germination" | "nursery" | "done";
  secs: number;
  germHumidAlarm: boolean;
}

/** Germination countdown timer */
function CountdownCard({ phase, secs, germHumidAlarm }: CountdownCardProps) {
  const { d, h, m, s } = fmtCountdown(secs);
  return (
    <div className="card">
      <div className="clabel">⏱ Germination Timer</div>
      {phase === "germination" && secs > 0 ? (
        <>
          <div className="cd-wrap">
            <div className="cd-seg">
              <div className="cd-num">{pad(d)}</div>
              <div className="cd-unit">days</div>
            </div>
            <div className="cd-sep">:</div>
            <div className="cd-seg">
              <div className="cd-num">{pad(h)}</div>
              <div className="cd-unit">hrs</div>
            </div>
            <div className="cd-sep">:</div>
            <div className="cd-seg">
              <div className="cd-num">{pad(m)}</div>
              <div className="cd-unit">min</div>
            </div>
            <div className="cd-sep">:</div>
            <div className="cd-seg">
              <div className="cd-num">{pad(s)}</div>
              <div className="cd-unit">sec</div>
            </div>
          </div>
          {germHumidAlarm && <div className="atag">⚠ Humidity Low!</div>}
        </>
      ) : phase === "germination" ? (
        <div className="cd-done">Complete ✓</div>
      ) : (
        <div className="cd-na">N/A — {phase} phase</div>
      )}
    </div>
  );
}

export default CountdownCard;
