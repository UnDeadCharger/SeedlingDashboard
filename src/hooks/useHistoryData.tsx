import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/api/apiClient";

/* ── Dummy data generator ─────────────────────────────────────── */
function makeDummyRow(id: number, date: Date) {
  const h = date.getHours();
  const isDaytime = h >= 6 && h < 18;
  const humid = 68 + Math.sin(h / 6) * 8 + (Math.random() - 0.5) * 4;
  return {
    id,
    receivedAt: date.toISOString(),
    tempLvl: +(24 + Math.sin(h / 8) * 3 + (Math.random() - 0.5)).toFixed(1),
    moistureLvl: +humid.toFixed(1),
    luxLvl: isDaytime
      ? Math.round(1500 + Math.sin(((h - 6) / 12) * Math.PI) * 3500 + Math.random() * 200)
      : Math.round(Math.random() * 30),
    waterLvl: "Normal",
    waterRawADC: 1350 + Math.round(Math.random() * 200),
    isLightOn: isDaytime,
    isFanOn: isDaytime ? true : date.getMinutes() % 20 < 15,
    isFan2On: isDaytime ? true : date.getMinutes() % 20 < 15,
    fanBoost: humid > 94,
    isMistingOn: humid < 70,
    mode: "auto",
    phase: "nursery",
    germRemainingSeconds: 0,
    nurseryDay: 3,
    isDaytime,
    fanCyclePos: date.getMinutes() % 20,
    germHumidAlarm: false,
    waterLvlAlarm: false,
    shtError: false,
    luxError: false,
    ntpOK: true,
    wifiOK: true,
  };
}

function generateDummyRows(total = 500) {
  const rows = [];
  const now = Date.now();
  for (let i = 0; i < total; i++) {
    // one row every 3 seconds going backwards
    rows.push(makeDummyRow(total - i, new Date(now - i * 3000)));
  }
  return rows;
}

const ALL_DUMMY_ROWS = generateDummyRows(500);

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
  apiUrl,
  page = 1,
  pageSize = 50,
  startTime,
  endTime,
  sortBy = "receivedAt",
  sortDir = "desc",
}: {
  apiUrl?: string;
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

    // ── No API URL → serve dummy data ───────────────────────────
    if (!apiUrl) {
      await new Promise((r) => setTimeout(r, 200)); // fake latency
      let filtered = ALL_DUMMY_ROWS;
      if (startTime) filtered = filtered.filter((r) => r.receivedAt >= startTime);
      if (endTime) filtered = filtered.filter((r) => r.receivedAt <= endTime);

      filtered = [...filtered].sort((a, b) => {
        // biome-ignore lint/style/useSingleVarDeclarator: <explanation>
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const av = (a as unknown as any[])[sortBy];
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const bv = (b as unknown as any[])[sortBy];
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });

      const start = (page - 1) * pageSize;
      setTotal(filtered.length);
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      setRows(filtered.slice(start, start + pageSize) as any);
      setLoading(false);
      return;
    }

    // ── Real API ─────────────────────────────────────────────────
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortDir,
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
      });
      const res = await apiClient.get(`${apiUrl}?${params}`);
      setRows(res.data);
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
  }, [apiUrl, page, pageSize, startTime, endTime, sortBy, sortDir]);

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
