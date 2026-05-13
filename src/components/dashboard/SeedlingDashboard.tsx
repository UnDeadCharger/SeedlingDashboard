import { useEffect, useState } from "react";

import { PHASE_STEPS } from "@/constants";

import SystemCommands from "./commands/SystemCommands";
import ManualPanel from "./controls/ManualPanel";
import DeviceCard from "./devices/DeviceCard";
import FanStatusCard from "./environment/FanStatusCard";
import LiveSensorCard from "./sensors/LiveSensorCard";
import SensorHealthCard from "./sensors/SensorHealthCard";
import { AlarmBanner } from "./status/AlarmBanner";
import CountdownCard from "./status/CountdownCard";
import NurseryDayCard from "./status/NurseryDayCard";
import { PhaseTimeline } from "./status/PhaseTimeline";
import WaterCard from "./status/WaterCard";

import type { SeedlingData } from "@/types";
interface SeedlingDashboardProps {
  data?: SeedlingData;
  onCommand?: (payload: {
    cmd: string;
    params?: Record<string, unknown>;
  }) => void;
}
/* ════════════════════════════════════════════════════════════════════════════
   SEEDLING GERMINATION / NURSERY DASHBOARD  v3
   ─────────────────────────────────────────────────────────────────────────
   Props:
     data        – live data object from your GET /api/seedling
                   (defaults to DUMMY_DATA when not provided)
     onCommand   – called when user clicks a control button
                   signature: onCommand({ cmd, params })

   Commands emitted:
     { cmd: "set_mode",   params: { mode: "auto"|"manual" } }
     { cmd: "set_phase",  params: { phase: "germination"|"nursery" } }
     { cmd: "manual_run", params: { light: <mins>, fan: <mins>, mist: <mins> } }
     { cmd: "stop" }
     { cmd: "reboot" }
   ════════════════════════════════════════════════════════════════════════════ */

/* ── Dummy data — replace with your API response ──────────────────────── */
const DUMMY_DATA: SeedlingData = {
  tempLvl: 26.4,
  moistureLvl: 68.0,
  luxLvl: 3200,
  shtError: false,
  luxError: false,

  waterLvl: "Normal", // "Under" | "Normal" | "Over" (firmware trims trailing spaces)
  waterLvlAlarm: false,
  waterRawADC: 1420,

  isLightOn: false,
  isFanOn: false, // germination → firmware forces false
  isFan2On: false,
  fanBoost: false,
  isMistingOn: false,

  mode: "auto", // "auto" | "manual"
  phase: "germination", // "germination" | "nursery" | "done"
  germRemainingSeconds: 2 * 86400 + 5 * 3600 + 42 * 60 + 17,
  nurseryDay: 0,
  isDaytime: false,
  fanCyclePos: 11, // minute % 20, meaningful only at night

  germHumidAlarm: false,
  ntpOK: true,
  wifiOK: true,
};

function SeedlingDashboard({ data: extData, onCommand = () => {} }: SeedlingDashboardProps) {
  // Demo simulation — only used when no external data is passed
  const [demoData, setDemoData] = useState<SeedlingData>(DUMMY_DATA);
  const data = extData ?? demoData;

  const sendCmd = (payload: {
    cmd: string;
    params?: Record<string, unknown>;
  }) => {
    onCommand(payload);
    // Simulate locally for demo (extData = undefined)
    //Do not send api for now
    if (!extData) {
      const { cmd, params = {} } = payload;
      setDemoData((d: SeedlingData) => {
        if (cmd === "set_mode") return { ...d, mode: params.mode as SeedlingData["mode"] };
        if (cmd === "set_phase")
          return {
            ...d,
            phase: params.phase as SeedlingData["phase"],
            germRemainingSeconds: params.phase === "germination" ? 86400 : 0,
            isFanOn: false,
            isFan2On: false,
          };
        if (cmd === "stop")
          return {
            ...d,
            isLightOn: false,
            isFanOn: false,
            isFan2On: false,
            isMistingOn: false,
          };
        return d;
      });
    }
  };

  // Live countdown — ticks down during germination
  const [secs, setSecs] = useState(data.germRemainingSeconds ?? 0);
  useEffect(() => {
    setSecs(data.germRemainingSeconds ?? 0);
  }, [data.germRemainingSeconds]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (data.phase !== "germination" || secs <= 0) return;
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [data.phase]);

  const isManual = data.mode === "manual";

  const alarmItems = [
    data.waterLvlAlarm && "💧 Water Level Low",
    data.germHumidAlarm && "💨 Humidity Low (Germination)",
    data.shtError && "🌡 SHT Sensor Error",
    data.luxError && "☀ Lux Sensor Error",
  ].filter(Boolean);

  // Humidity fill bar: 0%=0, 100%=100%
  const humidFill = data.moistureLvl != null ? `${Math.min(100, data.moistureLvl)}%` : "0%";
  const humidColor =
    data.moistureLvl > 75 ? "#4fc3f7" : data.moistureLvl < 70 ? "#ff5252" : "#3ddc7a";

  // Lux: rough 0–10000 lx scale
  const luxFill = data.luxLvl != null ? `${Math.min(100, (data.luxLvl / 10000) * 100)}%` : "0%";

  // Light icon
  const lightIcon = data.isLightOn ? (
    <span style={{ filter: "drop-shadow(0 0 8px rgba(245,166,35,0.9))" }}>💡</span>
  ) : (
    <span style={{ opacity: 0.35 }}>💡</span>
  );
  const mistIcon = data.isMistingOn ? (
    <span className="float">💦</span>
  ) : (
    <span style={{ opacity: 0.35 }}>💦</span>
  );

  return (
    <div className="dash">
      <div className="wrap">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="hdr">
          <div>
            <div className="hdr-title">
              Seedling <em>Control</em> Dashboard
            </div>
            <div className="hdr-sub">Germination &amp; Nursery Management System</div>
          </div>
          <div className="hdr-right">
            <div className="badges">
              <span
                className="badge"
                style={{
                  color: data.mode === "auto" ? "var(--accent)" : "var(--blue)",
                  background:
                    data.mode === "auto" ? "rgba(61,220,122,0.14)" : "rgba(79,195,247,0.14)",
                  borderColor: data.mode === "auto" ? "var(--accent)" : "var(--blue)",
                }}
              >
                ⚙ {data.mode}
              </span>
              <span
                className="badge"
                style={{
                  color: "var(--text-s)",
                  borderColor: "var(--bdr)",
                  background: "var(--surf2)",
                }}
              >
                {PHASE_STEPS.find((p) => p.key === data.phase)?.icon ?? "🌱"} {data.phase}
              </span>
            </div>
            <div className="conn-row">
              <span className="conn-item">
                <span className={`cdot ${data.wifiOK ? "cdot-ok" : "cdot-err"}`} />
                WiFi {data.wifiOK ? "Online" : "Offline"}
              </span>
              <span className="conn-item">
                <span className={`cdot ${data.ntpOK ? "cdot-ok" : "cdot-err"}`} />
                NTP {data.ntpOK ? "Synced" : "Error"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Mode & Phase Controls ──────────────────────────────── */}
        <div className="ctrl-row">
          <div className="ctrl-block">
            <div className="ctrl-lbl">Operating Mode</div>
            <div className="mode-bar">
              {["auto", "manual"].map((mo) => (
                <button
                  type="button"
                  key={mo}
                  className={`mode-btn ${data.mode === mo ? `mode-active-${mo}` : ""}`}
                  onClick={() => sendCmd({ cmd: "set_mode", params: { mode: mo } })}
                >
                  {mo === "auto" ? "⚙ Auto" : "⏱ Manual"}
                </button>
              ))}
            </div>
          </div>
          <div className="ctrl-block">
            <div className="ctrl-lbl">Phase Control</div>
            {data.phase !== "germination" ? (
              <button
                type="button"
                className="phase-btn"
                onClick={() =>
                  sendCmd({
                    cmd: "set_phase",
                    params: { phase: "germination" },
                  })
                }
              >
                🌱 Start Germination
              </button>
            ) : (
              <button
                type="button"
                className="phase-btn"
                onClick={() => sendCmd({ cmd: "set_phase", params: { phase: "nursery" } })}
              >
                ⏩ Skip to Nursery
              </button>
            )}
          </div>
        </div>

        {/* ── Alarm Banner ──────────────────────────────────────── */}
        {alarmItems.length > 0 && (
          <AlarmBanner
            waterLvlAlarm={data.waterLvlAlarm}
            germHumidAlarm={data.germHumidAlarm}
            shtError={data.shtError}
            luxError={data.luxError}
          />
        )}

        {/* ── Phase Timeline ────────────────────────────────────── */}
        <PhaseTimeline phase={data.phase} />

        {/* ── Live Sensors ──────────────────────────────────────── */}
        <div className="sec-hdr">
          <span className="sec-title">Live Sensors</span>
          <span className="sec-line" />
        </div>
        <div className="g3">
          <LiveSensorCard
            label="Temperature"
            icon="🌡️"
            value={data.shtError ? null : data.tempLvl?.toFixed(1)}
            unit="°C"
            hasError={data.shtError}
            fillPct={
              data.tempLvl != null ? `${Math.min(100, ((data.tempLvl - 15) / 25) * 100)}%` : "0%"
            }
            fillColor={data.tempLvl > 30 ? "#ff5252" : data.tempLvl > 27 ? "#f5a623" : "#3ddc7a"}
          />
          <LiveSensorCard
            label="Humidity"
            icon="💧"
            value={data.shtError ? null : data.moistureLvl?.toFixed(1)}
            unit="%"
            hasError={data.shtError}
            fillPct={humidFill}
            fillColor={humidColor}
          />
          <LiveSensorCard
            label="Light Intensity"
            icon="☀️"
            value={
              data.luxError
                ? null
                : data.luxLvl != null
                  ? Math.round(data.luxLvl).toLocaleString()
                  : null
            }
            unit="lux"
            hasError={data.luxError}
            fillPct={luxFill}
            fillColor="#f5a623"
          />
        </div>

        {/* ── System Status ─────────────────────────────────────── */}
        <div className="sec-hdr">
          <span className="sec-title">System Status</span>
          <span className="sec-line" />
        </div>
        <div className="g3">
          <WaterCard
            waterLvl={data.waterLvl}
            waterLvlAlarm={data.waterLvlAlarm}
            waterRawADC={data.waterRawADC}
          />
          <CountdownCard phase={data.phase} secs={secs} germHumidAlarm={data.germHumidAlarm} />
          <NurseryDayCard phase={data.phase} nurseryDay={data.nurseryDay} />
        </div>

        {/* ── Environment ───────────────────────────────────────── */}
        <div className="sec-hdr">
          <span className="sec-title">Environment</span>
          <span className="sec-line" />
        </div>
        <div className="g2">
          <div className="card">
            <div className="clabel">🕐 Time Period</div>
            <div className="dn-icon">{data.isDaytime ? "☀️" : "🌙"}</div>
            <div className="dn-label">{data.isDaytime ? "Daytime" : "Nighttime"}</div>
            <div className="dn-sub">
              {data.isDaytime
                ? "06:00–18:00 · Active schedule"
                : "18:00–06:00 · Fan on night cycle"}
            </div>
          </div>
          <FanStatusCard data={data} />
        </div>

        {/* ── Device Status ─────────────────────────────────────── */}
        <div className="sec-hdr">
          <span className="sec-title">Device Status</span>
          <span className="sec-line" />
          <span className="sec-note">
            {isManual ? "⚙ Manual — set timer below" : "🔒 Auto — schedule controlled"}
          </span>
        </div>
        <div className="g3">
          <DeviceCard
            icon={lightIcon}
            name="Grow Light"
            sub={
              data.isLightOn
                ? data.isDaytime
                  ? "On · Day schedule"
                  : "On · Active"
                : "Off · Standby"
            }
            isOn={data.isLightOn}
            onClass="dev-on-light"
            pillClass={data.isLightOn ? "sp-amber" : "sp-off"}
          />
          <div className={`dev-card ${data.isFanOn ? "dev-on-fan" : ""}`}>
            <div className="dev-top">
              <div className="dev-left">
                <div className="dev-icon">
                  {data.isFanOn ? (
                    <span className="spin-slow">🌀</span>
                  ) : (
                    <span style={{ opacity: 0.35 }}>🌀</span>
                  )}
                </div>
                <div>
                  <div className="dev-name">Ventilation Fan</div>
                  <div className="dev-sub">Fan 1 & Fan 2 always mirror</div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  alignItems: "flex-end",
                }}
              >
                <span className={`spill ${data.isFanOn ? "sp-green" : "sp-off"}`}>
                  {data.isFanOn ? "ON" : "OFF"}
                </span>
                {data.fanBoost && <span className="spill sp-boost">⚡ Boost</span>}
              </div>
            </div>
          </div>
          <DeviceCard
            icon={mistIcon}
            name="Misting System"
            sub={data.isMistingOn ? "Active · Humidifying" : "Off · Standby"}
            isOn={data.isMistingOn}
            onClass="dev-on-mist"
            pillClass={data.isMistingOn ? "sp-blue" : "sp-off"}
          />
        </div>

        {/* ── Manual Control Panel (visible only in manual mode) ── */}
        {isManual && <ManualPanel onCommand={sendCmd} />}

        {/* ── System Commands ───────────────────────────────────── */}
        <div className="sec-hdr">
          <span className="sec-title">System Commands</span>
          <span className="sec-line" />
        </div>
        <SystemCommands phase={data.phase} onCommand={sendCmd} />

        {/* ── Sensor Health ─────────────────────────────────────── */}
        <div className="sec-hdr">
          <span className="sec-title">Sensor Health</span>
          <span className="sec-line" />
        </div>
        <div className="g2">
          <SensorHealthCard
            icon="🌡️"
            name="SHT Sensor — Temperature & Humidity"
            hasError={data.shtError}
          />
          <SensorHealthCard icon="☀️" name="BH1750 — Ambient Light (Lux)" hasError={data.luxError} />
        </div>
      </div>
    </div>
  );
}

export default SeedlingDashboard;
