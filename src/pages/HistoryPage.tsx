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

import { useState } from "react";

import { apiClient } from "@/api/apiClient";
import ApiDocs from "@/components/history/ApiDocs";
import ActuatorChart from "@/components/history/chart/ActuatorChart";
import CombinedSensorChart from "@/components/history/chart/CombinedSensorChart";
import IndividualChart from "@/components/history/chart/IndividualChart";
import DateRangeBar from "@/components/history/table/DateRangeBar";
import SimpleTable from "@/components/history/table/SimpleTable";
import { useChartData } from "@/hooks/useChartData";
import { useHistoryData } from "@/hooks/useHistoryData";
import { defaultFrom, defaultTo, exportToCSV } from "@/utils/historyHelper";

import type { avgTypes } from "@/types";

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

  // Filtered slices
  const {
    data: chartData,
    // loading: chartLoading,
    // error: chartError,
  } = useChartData({
    startTime: fromDt,
    endTime: toDt,
  });

  const {
    rows: tableData,
    // total,
    // totalPages,
    // loading: tableLoading,
    // error: tableError,
  } = useHistoryData({
    startTime: fromDt,
    endTime: toDt,
    page: 1,
    pageSize: 50, // get all for export (in real app, implement proper pagination)
    sortBy: "receivedAt",
    sortDir: "desc",
  });

  const handleExport = async () => {
    const tag = expFrom.slice(0, 10);
    try {
      const params = new URLSearchParams({
        ...(expFrom && { from: expFrom }),
        ...(expTo && { to: expTo }),
      });

      const res = await apiClient.get(`/export?${params}`);
      const data = res.data;
      console.log("Fetched export data:", data);
      exportToCSV(data, `seedling_history_${tag}.csv`);
    } catch (err) {
      console.error("Export API error:", err);
      alert("Failed to fetch export data. See console for details.");
      return;
    }
  };

  return (
    <div className="dash">
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
          note={`${chartData?.length} hourly pts · ${tableData?.length} raw rows`}
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
                ↓ Export rows
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
