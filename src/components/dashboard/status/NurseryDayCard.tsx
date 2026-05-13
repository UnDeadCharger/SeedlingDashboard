interface NurseryDayCardProps {
  phase: "germination" | "nursery" | "done";
  nurseryDay: number;
}

/** Nursery day counter */
function NurseryDayCard({ phase, nurseryDay }: NurseryDayCardProps) {
  return (
    <div className="card">
      <div className="clabel">🌿 Nursery Progress</div>
      {phase === "nursery" || phase === "done" ? (
        <>
          <div className="nd-num">{nurseryDay}</div>
          <div className="nd-lbl">Day{nurseryDay !== 1 ? "s" : ""} in Nursery</div>
        </>
      ) : (
        <div className="cd-na">N/A — awaiting nursery phase</div>
      )}
    </div>
  );
}

export default NurseryDayCard;
