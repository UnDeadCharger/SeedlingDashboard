type DateRangeBarProps = {
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  note?: string;
};

function DateRangeBar({ from, to, onFrom, onTo, note }: DateRangeBarProps) {
  return (
    <div className="filter-bar">
      <span className="filter-label">From</span>
      <input
        className="date-input"
        type="datetime-local"
        value={from}
        onChange={(e) => onFrom(e.target.value)}
      />
      <span className="filter-label">To</span>
      <input
        className="date-input"
        type="datetime-local"
        value={to}
        onChange={(e) => onTo(e.target.value)}
      />
      {note && <span className="filter-note">{note}</span>}
    </div>
  );
}
export default DateRangeBar;
