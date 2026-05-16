import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/api/apiClient";

/* ─────────────────────────────────────────────────────────────── */

/**
 * Fetches paginated history records from the API.
 * Falls back to DUMMY data when API_URL is null/undefined.
 *
 * @param {object} params
 * @param {string}  params.apiUrl    – e.g. "/api/seedling/history"
 * @param {number}  params.page      – 1-indexed
 * @param {number}  params.pageSize  – rows per page (default 50)
 * @param {string}  params.startTime – ISO string
 * @param {string}  params.endTime   – ISO string
 * @param {string}  params.sortBy    – column key (default "receivedAt")
 * @param {"asc"|"desc"} params.sortDir
 *
 * @returns {{
 *   rows:       object[],
 *   total:      number,
 *   totalPages: number,
 *   loading:    boolean,
 *   error:      string|null,
 * }}
 */
export function useHistoryData({
  page = 1,
  pageSize = 50,
  startTime,
  endTime,
  sortBy = "receivedAt",
  sortDir = "desc",
}: {
  page?: number;
  pageSize?: number;
  startTime?: string;
  endTime?: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  sortBy?: any;
  sortDir?: "asc" | "desc";
}): {
  rows: never[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
} {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        order: sortDir,
        ...(startTime && { from: startTime }),
        ...(endTime && { to: endTime }),
      });
      const res = await apiClient.get(`/seedling/history?${params}`);
      setRows(res.data.rows);
      setTotal(res.data.total);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, startTime, endTime, sortBy, sortDir]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    rows,
    total,
    totalPages: Math.ceil(total / pageSize),
    loading,
    error,
  };
}
