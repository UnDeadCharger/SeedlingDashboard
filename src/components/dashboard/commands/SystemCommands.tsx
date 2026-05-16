import { useState } from "react";

import { DeviceCommand, type OnCommandProp } from "@/types/commands";

interface SystemCommandsProps {
  phase: "germination" | "nursery" | "done";
  onCommand: (payload: OnCommandProp) => void;
}

/** System command buttons — phase toggle + reboot */
function SystemCommands({ phase, onCommand }: SystemCommandsProps) {
  const [confirmReboot, setConfirmReboot] = useState(false);

  const handleReboot = () => {
    if (confirmReboot) {
      onCommand({ cmd: DeviceCommand.Reboot });
      setConfirmReboot(false);
    } else {
      setConfirmReboot(true);
      setTimeout(() => setConfirmReboot(false), 4000);
    }
  };

  const toGerm = phase !== "germination";
  const toNurs = phase === "germination";

  return (
    <div className="cmd-grid">
      {toGerm && (
        <button
          type="button"
          className="cmd-btn cmd-btn-phase-germ"
          onClick={() =>
            onCommand({
              cmd: DeviceCommand.SetPhase,
              params: { phase: "germination" },
            })
          }
        >
          <span className="cmd-btn-ico">🌱</span>
          Start Germination
        </button>
      )}
      {toNurs && (
        <button
          type="button"
          className="cmd-btn"
          onClick={() =>
            onCommand({
              cmd: DeviceCommand.SetPhase,
              params: { phase: "nursery" },
            })
          }
        >
          <span className="cmd-btn-ico">⏩</span>
          Skip to Nursery
        </button>
      )}
      <button
        type="button"
        className="cmd-btn"
        onClick={() => onCommand({ cmd: DeviceCommand.Stop })}
      >
        <span className="cmd-btn-ico">⏹</span>
        Stop All
      </button>
      <button
        type="button"
        className={`cmd-btn cmd-btn-danger ${confirmReboot ? "cmd-btn-danger-confirm" : ""}`}
        onClick={handleReboot}
      >
        <span className="cmd-btn-ico">🔄</span>
        {confirmReboot ? "Tap again to confirm" : "Reboot Device"}
      </button>
    </div>
  );
}

export default SystemCommands;
