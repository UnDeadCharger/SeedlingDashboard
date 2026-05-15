import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/api/apiClient";

/* ── Dummy hourly data generator ──────────────────────────────── */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function generateDummyChartData(startTime?: any, endTime?: any) {
  const start = startTime ? new Date(startTime) : new Date(Date.now() - 7 * 86400000);
  const end = endTime ? new Date(endTime) : new Date();

  // Round start down to the hour
  start.setMinutes(0, 0, 0);

  const points = [];
  const cur = new Date(start);

  while (cur <= end) {
    const h = cur.getHours();
    const isDaytime = h >= 6 && h < 18;
    const avgHumid = 70 + Math.sin(h / 6) * 8 + (Math.random() - 0.5) * 2;

    points.push({
      receivedAt: cur.toISOString(),
      // label shown on XAxis
      label: cur.toLocaleString("en-GB", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      avgTemp: +(24 + Math.sin(h / 8) * 3 + (Math.random() - 0.5) * 0.5).toFixed(2),
      avgHumid: +avgHumid.toFixed(2),
      avgLux: isDaytime
        ? Math.round(1500 + Math.sin(((h - 6) / 12) * Math.PI) * 3500 + Math.random() * 150)
        : Math.round(Math.random() * 20),
      // duty cycle ratios 0–1 (fraction of readings per hour where device was ON)
      lightOnRatio: isDaytime ? 1 : 0,
      fanOnRatio: isDaytime ? 1 : 0.75, // night cycle ~15/20 = 0.75
      mistOnRatio: avgHumid < 70 ? 0.8 : avgHumid > 75 ? 0 : 0.3,
    });

    cur.setHours(cur.getHours() + 1);
  }

  return points;
}

/* ─────────────────────────────────────────────────────────────── */

/**
 * Fetches hourly-averaged chart data for the given time range.
 * Backend must return one averaged data point per hour.
 * Falls back to dummy data when apiUrl is null/undefined.
 *
 * @param {object} params
 * @param {string}  params.apiUrl    – e.g. "/api/seedling/chart"
 * @param {string}  params.startTime – ISO string
 * @param {string}  params.endTime   – ISO string
 *
 * @returns {{
 *   data:    object[],   – array of hourly averaged points
 *   loading: boolean,
 *   error:   string|null,
 * }}
 */
export function useChartData({
  apiUrl,
  startTime,
  endTime,
}: {
  apiUrl?: string;
  startTime?: string;
  endTime?: string;
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChart = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!apiUrl) {
      await new Promise((r) => setTimeout(r, 150));
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      setData(generateDummyChartData(startTime, endTime) as any);
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
      });

      const res = await apiClient.get(`${apiUrl}?${params}`);
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [apiUrl, startTime, endTime]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  return { data, loading, error };
}
