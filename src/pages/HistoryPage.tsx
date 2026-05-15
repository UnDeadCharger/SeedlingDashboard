/**
 * HistoryPage.jsx
 *
 * ─────────────────────────────────────────────────────────────────
 * TABLE NOTE:
 *   This file ships a self-contained simple table for the artifact
 *   preview. In your real project replace it with @tanstack/react-table:
 *
 *   npm i @tanstack/react-table
 *
 *   then swap `<SimpleTable>` with a TanStack table instance using
 *   getCoreRowModel + getPaginationRowModel + getSortedRowModel.
 *   The column definitions (TABLE_COLS) are written to be compatible.
 *
 * REQUIRED API ENDPOINTS — documented at bottom of this file and
 * rendered in the <ApiDocs /> section on the page.
 * ─────────────────────────────────────────────────────────────────
 */

import { useMemo, useState } from "react";

import ApiDocs from "@/components/history/ApiDocs";
import ActuatorChart from "@/components/history/chart/ActuatorChart";
import CombinedSensorChart from "@/components/history/chart/CombinedSensorChart";
import IndividualChart from "@/components/history/chart/IndividualChart";
import DateRangeBar from "@/components/history/table/DateRangeBar";
import SimpleTable from "@/components/history/table/SimpleTable";
import { defaultFrom, defaultTo, exportToCSV, filterByRange } from "@/utils/historyHelper";

import type { SeedlingData, avgTypes } from "@/types";
/* ══════════════════════════════════════════════════════════════════
   DUMMY DATA  — replace with your API calls
══════════════════════════════════════════════════════════════════ */

/** Generates hourly-averaged chart data for the last `hours` hours */
function generateHourlyData(hours = 168) {
  const now = Date.now();
  return Array.from({ length: hours }, (_, i) => {
    const ts = new Date(now - (hours - 1 - i) * 3_600_000);
    const h = ts.getHours();
    const day = h >= 6 && h < 18;
    const s = Math.sin;
    return {
      receivedAt: ts.toISOString(),
      avgTemp: +(23 + s(i / 12) * 3 + (day ? 2 : 0) + (Math.random() - 0.5)).toFixed(1),
      avgHumid: +(70 + s(i / 10) * 8 + (Math.random() - 0.5) * 3).toFixed(1),
      avgLux: day
        ? +(2000 + s(((h - 6) / 12) * Math.PI) * 3500 + Math.random() * 300).toFixed(0)
        : +(Math.random() * 20).toFixed(0),
      lightOnPct: day ? +(0.92 + Math.random() * 0.08).toFixed(2) : 0,
      fanOnPct: day ? 1 : Math.random() > 0.25 ? 0.75 : 0.1,
      mistOnPct: +(Math.random() * 0.3).toFixed(2),
    };
  });
}

/** Generates raw row data (1 row per 3-second POST) */
function generateTableData(rows = 350): SeedlingData[] {
  const now = Date.now();
  return Array.from({ length: rows }, (_, i) => {
    const ts = new Date(now - i * 3_000);
    const h = ts.getHours();
    const day = h >= 6 && h < 18;
    const phase = i < 60 ? "germination" : "nursery";
    const temp = +(23 + Math.sin(i / 50) * 3 + (Math.random() - 0.5)).toFixed(1);
    const humid = +(70 + Math.sin(i / 40) * 8 + (Math.random() - 0.5) * 2).toFixed(1);
    const lux = day ? Math.round(2000 + Math.random() * 3000) : Math.round(Math.random() * 20);
    const adc = Math.round(1100 + Math.random() * 600);
    return {
      id: rows - i,
      receivedAt: ts.toISOString(),
      tempLvl: temp,
      moistureLvl: humid,
      luxLvl: lux,
      waterLvl: adc < 1000 ? "Under" : adc > 1800 ? "Over" : "Normal",
      waterRawADC: adc,
      isLightOn: day && phase === "nursery",
      isFanOn: phase === "nursery" && day,
      isFan2On: phase === "nursery" && day,
      fanBoost: temp > 30 || humid > 95,
      isMistingOn: humid < 70,
      mode: Math.random() > 0.9 ? "manual" : "auto",
      phase,
      germRemainingSeconds: phase === "germination" ? Math.max(0, 86400 - i * 3) : 0,
      nurseryDay: phase === "nursery" ? Math.floor(((i - 60) * 3) / 86400) + 1 : 0,
      isDaytime: day,
      fanCyclePos: ts.getMinutes() % 20,
      germHumidAlarm: phase === "germination" && humid < 70,
      waterLvlAlarm: adc < 1000,
      shtError: Math.random() < 0.005,
      luxError: Math.random() < 0.005,
      ntpOK: true,
      wifiOK: true,
    };
  });
}

export default function HistoryPage() {
  // Shared view filter
  const [fromDt, setFromDt] = useState(defaultFrom);
  const [toDt, setToDt] = useState(defaultTo);

  // Separate export range (defaults to match view filter)
  const [expFrom, setExpFrom] = useState(defaultFrom);
  const [expTo, setExpTo] = useState(defaultTo);

  // Tab
  const [tab, setTab] = useState("charts");

  // Combined chart line visibility toggles
  const [visible, setVisible] = useState({
    avgTemp: true,
    avgHumid: true,
    avgLux: true,
  });
  const toggleLine = (key: keyof typeof avgTypes) => setVisible((v) => ({ ...v, [key]: !v[key] }));

  // Dummy data (generated once)
  const allChart = useMemo(() => generateHourlyData(168), []);
  const allTable = useMemo(() => generateTableData(350), []);

  // Filtered slices
  const chartData = useMemo(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    () => filterByRange(allChart as any, fromDt, toDt),
    [allChart, fromDt, toDt]
  );
  const tableData = useMemo(() => filterByRange(allTable, fromDt, toDt), [allTable, fromDt, toDt]);
  const exportData = useMemo(
    () => filterByRange(allTable, expFrom, expTo),
    [allTable, expFrom, expTo]
  );

  const handleExport = () => {
    const tag = expFrom.slice(0, 10);
    exportToCSV(exportData, `seedling-${tag}.csv`);
  };

  return (
    <div className="dash">
      \{" "}
      <div className="wrap">
        {/* Header */}
        <div className="hdr">
          <div>
            <div className="hdr-title">
              Sensor <em>History</em>
            </div>
            <div className="hdr-sub">Historical Data · Charts · CSV Export</div>
          </div>
        </div>

        {/* Shared date range filter */}
        <DateRangeBar
          from={fromDt}
          to={toDt}
          onFrom={setFromDt}
          onTo={setToDt}
          note={`${chartData.length} hourly pts · ${tableData.length} raw rows`}
        />

        {/* Tab switcher */}
        <div className="hist-tabs">
          <button
            type="button"
            className={`hist-tab ${tab === "charts" ? "hist-tab-active" : ""}`}
            onClick={() => setTab("charts")}
          >
            📊 Charts
          </button>
          <button
            type="button"
            className={`hist-tab ${tab === "table" ? "hist-tab-active" : ""}`}
            onClick={() => setTab("table")}
          >
            📋 Data Table
          </button>
        </div>

        {/* ── CHARTS TAB ─────────────────────────────────────────── */}
        {tab === "charts" && (
          <>
            <CombinedSensorChart data={chartData} visible={visible} onToggle={toggleLine} />
            <div className="g3">
              <IndividualChart
                data={chartData}
                dataKey="avgTemp"
                title="🌡 Temperature"
                color="#ff5252"
                unit="°C"
                yDomain={["auto", "auto"]}
              />
              <IndividualChart
                data={chartData}
                dataKey="avgHumid"
                title="💧 Humidity"
                color="#4fc3f7"
                unit="%"
                yDomain={[0, 100]}
              />
              <IndividualChart
                data={chartData}
                dataKey="avgLux"
                title="☀ Light (Lux)"
                color="#f5a623"
                unit=""
                yDomain={[0, "auto"]}
              />
            </div>
            <ActuatorChart data={chartData} />
          </>
        )}

        {/* ── TABLE TAB ──────────────────────────────────────────── */}
        {tab === "table" && (
          <>
            {/* CSV export panel — separate range from view filter */}
            <div className="export-panel">
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "var(--blue)",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                📥 CSV Export
              </span>
              <DateRangeBar
                from={expFrom}
                to={expTo}
                onFrom={setExpFrom}
                onTo={setExpTo}
                note={undefined}
              />
              <button type="button" className="export-btn" onClick={handleExport}>
                ↓ Export {exportData.length.toLocaleString()} rows
              </button>
            </div>

            <SimpleTable data={tableData} />
          </>
        )}

        {/* ── API DOCS ───────────────────────────────────────────── */}
        <div style={{ marginTop: 40 }}>
          <div className="sec-hdr">
            <span className="sec-title">API Requirements</span>
            <span className="sec-line" />
          </div>
          <ApiDocs />
        </div>
      </div>
    </div>
  );
}

// import { useSendCommand } from "@/hooks/useSendCommand";

// const API_URL = import.meta.env.VITE_API_BASE_URL;

// export default function HistoryPage() {
//   // // Poll every 3 seconds (matches ESP32 POST interval)
//   // const { data, loading, error } = useSeedlingData(`${API_URL}/latest`, 10000);
//   // // const { send } = useSendCommand(API_URL);

//   // if (loading) {
//   //   return (
//   //     <div
//   //       style={{
//   //         display: "flex",
//   //         alignItems: "center",
//   //         justifyContent: "center",
//   //         minHeight: "100vh",
//   //         background: "#050f09",
//   //         color: "#3ddc7a",
//   //         fontFamily: "monospace",
//   //       }}
//   //     >
//   //       Connecting to device...
//   //     </div>
//   //   );
//   // }

//   // if (error && !data) {
//   //   return (
//   //     <div
//   //       style={{
//   //         display: "flex",
//   //         alignItems: "center",
//   //         justifyContent: "center",
//   //         minHeight: "100vh",
//   //         background: "#050f09",
//   //         color: "#ff5252",
//   //         fontFamily: "monospace",
//   //       }}
//   //     >
//   //       Connection error: {error}
//   //     </div>
//   //   );
//   // }

//   return <HistoryPage />;
// }
