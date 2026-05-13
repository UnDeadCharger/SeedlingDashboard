import { useState } from "react";

import Stepper from "@/components/ui/Stepper";

interface ManualPanelProps {
  onCommand: (payload: {
    cmd: string;
    params?: Record<string, unknown>;
  }) => void;
}

/** Manual control panel — timer inputs + run/stop */
function ManualPanel({ onCommand }: ManualPanelProps) {
  const [lightMins, setLightMins] = useState(0);
  const [fanMins, setFanMins] = useState(0);
  const [mistMins, setMistMins] = useState(0);

  const handleRun = () => {
    onCommand({
      cmd: "manual_run",
      params: { light: lightMins, fan: fanMins, mist: mistMins },
    });
  };

  return (
    <div className="manual-panel">
      <div className="manual-title">⏱ Manual Timer Setup</div>
      <div className="stp-rows">
        <Stepper
          icon="💡"
          name="Grow Light"
          value={lightMins}
          onChange={setLightMins}
          step={15}
          max={720}
        />
        <Stepper
          icon="🌀"
          name="Ventilation Fan"
          value={fanMins}
          onChange={setFanMins}
          step={15}
          max={720}
        />
        <Stepper
          icon="💦"
          name="Misting System"
          value={mistMins}
          onChange={setMistMins}
          step={1}
          max={120}
        />
      </div>
      <div className="manual-btns">
        <button type="button" className="run-btn" onClick={handleRun}>
          ▶ Run Timers
        </button>
        <button type="button" className="stop-btn" onClick={() => onCommand({ cmd: "stop" })}>
          ⏹ Stop All
        </button>
      </div>
    </div>
  );
}

export default ManualPanel;
