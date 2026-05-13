import type React from "react";

interface DeviceCardProps {
  icon: React.ReactNode;
  name: string;
  sub: string;
  isOn: boolean;
  onClass: string;
  pillClass: string;
}

/** Read-only device status card (light / misting) */
function DeviceCard({ icon, name, sub, isOn, onClass, pillClass }: DeviceCardProps) {
  return (
    <div className={`dev-card ${isOn ? onClass : ""}`}>
      <div className="dev-top">
        <div className="dev-left">
          <div className="dev-icon">{icon}</div>
          <div>
            <div className="dev-name">{name}</div>
            <div className="dev-sub">{sub}</div>
          </div>
        </div>
        <span className={`spill ${pillClass}`}>{isOn ? "ON" : "OFF"}</span>
      </div>
    </div>
  );
}

export default DeviceCard;
