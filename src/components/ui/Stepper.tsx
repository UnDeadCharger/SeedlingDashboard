interface StepperProps {
  icon: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
  step: number;
  max: number;
}

/** Number stepper for manual timer inputs */
function Stepper({ icon, name, value, onChange, step, max }: StepperProps) {
  const isOff = value === 0;
  return (
    <div className="stp-row">
      <div className="stp-ico">{icon}</div>
      <div className="stp-name">{name}</div>
      <div className="stp-ctrl">
        <button
          type="button"
          className="stp-btn"
          onClick={() => onChange(Math.max(0, value - step))}
        >
          −
        </button>
        <span className={`stp-val ${isOff ? "stp-off" : ""}`}>
          {isOff ? "OFF" : `${value} min`}
        </span>
        <button
          type="button"
          className="stp-btn"
          onClick={() => onChange(Math.min(max, value + step))}
        >
          +
        </button>
      </div>
      <span className="stp-max">max {max} min</span>
    </div>
  );
}
export default Stepper;
