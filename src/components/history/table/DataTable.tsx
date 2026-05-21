import { useState } from "react";

import dayjs from "@/utils/dayjsSetup";
/**
 * Paginated data table using TanStack Table v8.
 * Sorting and pagination are server-side — parent controls page/sort state.
 *
 * Props:
 *   rows        – current page rows from useHistoryData
 *   total       – total row count across all pages
 *   totalPages  – total number of pages
 *   page        – current 1-indexed page
 *   pageSize    – rows per page
 *   sortBy      – current sort column key
 *   sortDir     – "asc" | "desc"
 *   loading     – boolean
 *   onPageChange   – (newPage) => void
 *   onSizeChange   – (newSize) => void
 *   onSortChange   – ({ sortBy, sortDir }) => void
 */
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { SeedlingData } from "@/types";
/* ── Column definitions ─────────────────────────────────────── */
const ch = createColumnHelper<SeedlingData>();

const BoolPill = ({
  v,
  onColor = "sp-green",
  label = ["ON", "OFF"],
}: {
  v?: boolean;
  onColor?: string;
  label?: [string, string];
}) => <span className={`spill ${v ? onColor : "sp-off"}`}>{v ? label[0] : label[1]}</span>;

const ModeBadge = ({ v }: { v?: string }) => (
  <span className={`spill ${v === "auto" ? "sp-green" : "sp-blue"}`}>{v}</span>
);

const PhaseBadge = ({ v }: { v?: string }) => {
  const map = { germination: "sp-amber", nursery: "sp-green", done: "sp-off" };
  return <span className={`spill ${map[v as keyof typeof map] ?? "sp-off"}`}>{v}</span>;
};

const fmtTs = (iso?: string) => {
  if (!iso) return "—";
  // biome-ignore lint/style/useTemplate: <explanation>
  return dayjs(iso.replace(" ", "T")).local().format("DD/MM/YYYY, HH:mm:ss");
};
// Primary columns — shown by default
const PRIMARY_COLS = [
  ch.accessor("receivedAt", {
    header: "receivedAt",
    cell: (i) => (
      <span style={{ fontFamily: "Courier Prime, monospace", fontSize: "0.78rem" }}>
        {fmtTs(i.getValue())}
      </span>
    ),
    enableSorting: true,
  }),
  ch.accessor("tempLvl", {
    header: "Temp °C",
    cell: (i) => <span style={{ color: "var(--amber)" }}>{i.getValue()?.toFixed(1) ?? "—"}</span>,
    enableSorting: true,
  }),
  ch.accessor("moistureLvl", {
    header: "Humid %",
    cell: (i) => <span style={{ color: "var(--blue)" }}>{i.getValue()?.toFixed(1) ?? "—"}</span>,
    enableSorting: true,
  }),
  ch.accessor("luxLvl", {
    header: "Lux",
    cell: (i) => i.getValue()?.toLocaleString() ?? "—",
    enableSorting: true,
  }),
  ch.accessor("waterLvl", {
    header: "Water",
    cell: (i) => {
      const v = (i.getValue() || "").trim();
      const c = v === "Under" ? "sp-alarm" : v === "Over" ? "sp-blue" : "sp-green";
      return <span className={`spill ${c}`}>{v || "—"}</span>;
    },
    enableSorting: false,
  }),
  ch.accessor("isLightOn", {
    header: "Light",
    cell: (i) => <BoolPill v={i.getValue()} onColor="sp-amber" />,
    enableSorting: false,
  }),
  ch.accessor("isFanOn", {
    header: "Fan",
    cell: (i) => <BoolPill v={i.getValue()} />,
    enableSorting: false,
  }),
  ch.accessor("isMistingOn", {
    header: "Mist",
    cell: (i) => <BoolPill v={i.getValue()} onColor="sp-blue" />,
    enableSorting: false,
  }),
  ch.accessor("mode", {
    header: "Mode",
    cell: (i) => <ModeBadge v={i.getValue()} />,
    enableSorting: false,
  }),
  ch.accessor("phase", {
    header: "Phase",
    cell: (i) => <PhaseBadge v={i.getValue()} />,
    enableSorting: false,
  }),
];

// Secondary columns — hidden by default
const SECONDARY_COLS = [
  ch.accessor("waterRawADC", {
    header: "ADC",
    cell: (i) => i.getValue() ?? "—",
    enableSorting: true,
  }),
  ch.accessor("isFan2On", {
    header: "Fan 2",
    cell: (i) => <BoolPill v={i.getValue()} />,
    enableSorting: false,
  }),
  ch.accessor("fanBoost", {
    header: "Boost",
    cell: (i) => <BoolPill v={i.getValue()} onColor="sp-alarm" label={["⚡ ON", "OFF"]} />,
    enableSorting: false,
  }),
  ch.accessor("nurseryDay", {
    header: "Nurs. Day",
    cell: (i) => i.getValue() ?? "—",
    enableSorting: true,
  }),
  ch.accessor("germRemainingSeconds", {
    header: "Germ Rem (s)",
    cell: (i) => i.getValue() ?? "—",
    enableSorting: true,
  }),
  ch.accessor("isDaytime", {
    header: "Daytime",
    cell: (i) => <BoolPill v={i.getValue()} onColor="sp-amber" label={["☀", "🌙"]} />,
    enableSorting: false,
  }),
  ch.accessor("fanCyclePos", {
    header: "Cycle Pos",
    cell: (i) => i.getValue() ?? "—",
    enableSorting: false,
  }),
  ch.accessor("germHumidAlarm", {
    header: "H Alarm",
    cell: (i) => (i.getValue() ? <span style={{ color: "var(--alarm)" }}>⚠ YES</span> : "—"),
    enableSorting: false,
  }),
  ch.accessor("waterLvlAlarm", {
    header: "W Alarm",
    cell: (i) => (i.getValue() ? <span style={{ color: "var(--alarm)" }}>⚠ YES</span> : "—"),
    enableSorting: false,
  }),
  ch.accessor("shtError", {
    header: "SHT Err",
    cell: (i) => (i.getValue() ? <span style={{ color: "var(--alarm)" }}>⚠</span> : "✓"),
    enableSorting: false,
  }),
  ch.accessor("luxError", {
    header: "Lux Err",
    cell: (i) => (i.getValue() ? <span style={{ color: "var(--alarm)" }}>⚠</span> : "✓"),
    enableSorting: false,
  }),
  ch.accessor("ntpOK", {
    header: "NTP",
    cell: (i) => <BoolPill v={i.getValue()} label={["✓", "✗"]} />,
    enableSorting: false,
  }),
  ch.accessor("wifiOK", {
    header: "WiFi",
    cell: (i) => <BoolPill v={i.getValue()} label={["✓", "✗"]} />,
    enableSorting: false,
  }),
];

const ALL_COLS = [...PRIMARY_COLS, ...SECONDARY_COLS];

// Default visibility: secondary cols hidden
const DEFAULT_VIS = Object.fromEntries(SECONDARY_COLS.map((c) => [c.accessorKey, false]));
type DataTableProps = {
  rows: SeedlingData[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
  onSortChange: (params: { sortBy: string; sortDir: "asc" | "desc" }) => void;
};
/* ── Component ──────────────────────────────────────────────── */
export function DataTable({
  rows,
  total,
  totalPages,
  page,
  pageSize,
  sortBy,
  sortDir,
  loading,
  onPageChange,
  onSizeChange,
  onSortChange,
}: DataTableProps) {
  const [colVis, setColVis] = useState(DEFAULT_VIS);
  const [showToggle, setShowToggle] = useState(false);

  const table = useReactTable({
    data: rows,
    columns: ALL_COLS,
    state: { columnVisibility: colVis },
    onColumnVisibilityChange: setColVis,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
  });

  const handleSort = (colKey: string | undefined) => {
    if (!colKey) return;
    onSortChange({
      sortBy: colKey,
      sortDir: sortBy === colKey && sortDir === "asc" ? "desc" : "asc",
    });
  };

  const sortIcon = (key: string | undefined) => {
    const active = sortBy === key;
    return (
      <span className={`sort-ico ${active ? "sort-active" : ""}`}>
        {active ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕"}
      </span>
    );
  };
  return (
    <div className="tbl-wrap" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Controls row */}
      <div
        className="pg-row"
        style={{ padding: "10px 14px", borderBottom: "1px solid var(--bdr)" }}
      >
        <div className="pg-info">{loading ? "Loading…" : `${total.toLocaleString()} records`}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            className="date-input"
            value={pageSize}
            onChange={(e) => onSizeChange(Number(e.target.value))}
          >
            {[25, 50, 100].map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
          <button type="button" className="pg-btn" onClick={() => setShowToggle((v) => !v)}>
            ⚙ Columns
          </button>
        </div>
      </div>

      {/* Column visibility toggle panel */}
      {showToggle && (
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--bdr)",
            background: "var(--surf2)",
          }}
        >
          <div className="sort-ico" style={{ marginBottom: 8 }}>
            Toggle columns
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {table.getAllColumns().map((col) => (
              <label
                key={col.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "0.72rem",
                  color: "var(--text-s)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={col.getIsVisible()}
                  onChange={col.getToggleVisibilityHandler()}
                />
                <span>{col.columnDef.header?.toString()}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.columnDef.enableSorting;
                  const key = header.column.id; //swap with accessory if possible
                  return (
                    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                    <th
                      key={header.id}
                      style={{ cursor: canSort ? "pointer" : "default" }}
                      onClick={() => canSort && handleSort(key)}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && sortIcon(key)}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={99}
                  style={{
                    padding: "40px 0",
                    textAlign: "center",
                    color: "var(--text-m)",
                    fontStyle: "italic",
                  }}
                >
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={99}
                  style={{
                    padding: "40px 0",
                    textAlign: "center",
                    color: "var(--text-m)",
                    fontStyle: "italic",
                  }}
                >
                  No records in selected range.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pg-row" style={{ padding: "12px 14px", borderTop: "1px solid var(--bdr)" }}>
        <span className="pg-info">
          Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
        </span>
        <div className="pg-btns">
          <button
            type="button"
            className="pg-btn"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            «
          </button>
          <button
            type="button"
            className="pg-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            ‹
          </button>
          <button
            type="button"
            className="pg-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= (totalPages || 1)}
          >
            ›
          </button>
          <button
            type="button"
            className="pg-btn"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= (totalPages || 1)}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
