import { useMemo, useState } from "react";

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
import { TABLE_COLS } from "@/constants";

const PAGE_SIZE = 50;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function SimpleTable({ data }: { data: any[] }) {
  const [sortKey, setSortKey] = useState("receivedAt");
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av < bv) return sortDesc ? 1 : -1;
      if (av > bv) return sortDesc ? -1 : 1;
      return 0;
    });
  }, [data, sortKey, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const handleSort = (key: any) => {
    if (sortKey === key) setSortDesc((d) => !d);
    else {
      setSortKey(key);
      setSortDesc(true);
    }
    setPage(0);
  };

  const pageNums = useMemo(() => {
    const start = Math.max(0, Math.min(page - 2, totalPages - 5));
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);
  }, [page, totalPages]);

  if (data.length === 0) {
    return (
      <div
        style={{
          padding: "40px 0",
          textAlign: "center",
          color: "var(--text-m)",
          fontStyle: "italic",
        }}
      >
        No records in selected range
      </div>
    );
  }

  return (
    <>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              {TABLE_COLS.map((col) => (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                <th
                  key={col.key}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  style={{ cursor: col.sortable ? "pointer" : "default" }}
                >
                  {col.label}
                  {col.sortable && (
                    <span className={`sort-ico ${sortKey === col.key ? "sort-active" : ""}`}>
                      {sortKey === col.key ? (sortDesc ? " ↓" : " ↑") : " ↕"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row) => (
              <tr key={row.id}>
                {TABLE_COLS.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key]) : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pg-row">
        <div className="pg-info">
          {sorted.length === 0
            ? "No records"
            : `Showing ${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, sorted.length)} of ${sorted.length}`}
        </div>
        <div className="pg-btns">
          <button type="button" className="pg-btn" onClick={() => setPage(0)} disabled={page === 0}>
            «
          </button>
          <button
            type="button"
            className="pg-btn"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
          >
            ‹
          </button>
          {pageNums.map((p) => (
            <button
              type="button"
              key={p}
              className={`pg-btn ${p === page ? "pg-btn-cur" : ""}`}
              onClick={() => setPage(p)}
            >
              {p + 1}
            </button>
          ))}
          <button
            type="button"
            className="pg-btn"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
          >
            ›
          </button>
          <button
            type="button"
            className="pg-btn"
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
          >
            »
          </button>
        </div>
      </div>
    </>
  );
}

export default SimpleTable;
