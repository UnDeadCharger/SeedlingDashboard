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
import ActuatorChart from "@/components/history/chart/ActuatorChart";
import CombinedSensorChart from "@/components/history/chart/CombinedSensorChart";
import IndividualChart from "@/components/history/chart/IndividualChart";
import { DataTable } from "@/components/history/table/DataTable";
import DateRangeBar from "@/components/history/table/DateRangeBar";
import { useChartData } from "@/hooks/useChartData";
import { useHistoryData } from "@/hooks/useHistoryData";
import { defaultFrom, defaultTo, exportToCSV } from "@/utils/historyHelper";

import type { avgTypes } from "@/types";

export default function HistoryPage() {
  // Shared view filter
  const [fromDt, setFromDt] = useState(defaultFrom);
  const [toDt, setToDt] = useState(defaultTo);

  // Tab
  const [tab, setTab] = useState("charts");

  // Pagination / sort state for DataTable
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState<string>("receivedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // 30-day max range clamp handlers
  const MAX_RANGE_MS = 30 * 86_400_000;
  const handleFromDt = (v: string) => {
    setFromDt(v);
    if (toDt && v) {
      const diff = new Date(toDt).getTime() - new Date(v).getTime();
      if (diff > MAX_RANGE_MS)
        setToDt(new Date(new Date(v).getTime() + MAX_RANGE_MS).toISOString().slice(0, 16));
    }
  };
  const handleToDt = (v: string) => {
    setToDt(v);
    if (fromDt && v) {
      const diff = new Date(v).getTime() - new Date(fromDt).getTime();
      if (diff > MAX_RANGE_MS)
        setFromDt(new Date(new Date(v).getTime() - MAX_RANGE_MS).toISOString().slice(0, 16));
    }
  };

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
    total,
    totalPages,
    loading: tableLoading,
  } = useHistoryData({
    startTime: fromDt,
    endTime: toDt,
    page,
    pageSize,
    sortBy,
    sortDir,
  });

  const handleExport = async () => {
    const tag = fromDt.slice(0, 10);
    try {
      const params = new URLSearchParams({
        ...(fromDt && { from: fromDt }),
        ...(toDt && { to: toDt }),
      });
      const res = await apiClient.get(`/seedling/export?${params}`);
      const data = res.data;
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
          onFrom={handleFromDt}
          onTo={handleToDt}
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

        {/* ── TABLE TAB ──────────────────────────────────────────── */}
        {tab === "table" && (
          <>
            {/* CSV export panel — uses current view date range */}
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
              <span style={{ fontSize: "0.72rem", color: "var(--text-s)" }}>
                Exports current view range: {fromDt.slice(0, 10)} → {toDt.slice(0, 10)}
              </span>
              <button type="button" className="export-btn" onClick={handleExport}>
                ↓ Export rows
              </button>
            </div>

            <DataTable
              rows={tableData}
              total={total}
              totalPages={totalPages}
              page={page}
              pageSize={pageSize}
              sortBy={sortBy}
              sortDir={sortDir}
              loading={tableLoading}
              onPageChange={setPage}
              onSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
              onSortChange={({ sortBy: sb, sortDir: sd }) => {
                setSortBy(sb);
                setSortDir(sd);
                setPage(1);
              }}
            />
          </>
        )}
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
