import { useCallback, useEffect, useRef, useState } from "react";

import { apiClient } from "@/api/apiClient";
import dayjs from "@/utils/dayjsSetup";

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
  sortBy?: string;
  sortDir?: "asc" | "desc";
}) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache total — only re-fetch COUNT(*) when range actually changes
  const cachedRangeRef = useRef<{
    startTime?: string;
    endTime?: string;
    pageSize?: number;
  }>({});
  const cachedTotalRef = useRef<{ total: number; totalPages: number }>({
    total: 0,
    totalPages: 1,
  });

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);

    const rangeChanged =
      cachedRangeRef.current.startTime !== startTime ||
      cachedRangeRef.current.endTime !== endTime ||
      cachedRangeRef.current.pageSize !== pageSize;

    // Only ask server for COUNT(*) when range changes or first load
    const needsTotal = rangeChanged || cachedTotalRef.current.total === 0;

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        order: sortDir,
        // Convert local input time → UTC before sending to API
        ...(startTime && {
          from: dayjs(startTime).utc().format("YYYY-MM-DD HH:mm:ss"),
        }),
        ...(endTime && {
          to: dayjs(endTime).utc().format("YYYY-MM-DD HH:mm:ss"),
        }),
        ...(needsTotal && { includeTotal: "true" }),
      });

      const res = await apiClient.get(`/seedling/history?${params}`);

      setRows(res.data.rows);

      if (needsTotal && res.data.total !== undefined) {
        cachedTotalRef.current = {
          total: res.data.total,
          totalPages: res.data.totalPages,
        };
        cachedRangeRef.current = { startTime, endTime, pageSize };
      }

      // Always sync state from cache
      setTotal(cachedTotalRef.current.total);
      setTotalPages(cachedTotalRef.current.totalPages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, startTime, endTime, sortBy, sortDir]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return { rows, total, totalPages, loading, error };
}
