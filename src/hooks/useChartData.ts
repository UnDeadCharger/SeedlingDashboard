import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/api/apiClient";

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
  startTime,
  endTime,
}: {
  startTime?: string;
  endTime?: string;
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        ...(startTime && { from: startTime }),
        ...(endTime && { to: endTime }),
      });

      const res = await apiClient.get(`/chart?${params}`);
      console.log(res);
      console.log("Fetched chart data:", res.data);
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [startTime, endTime]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  return { data, loading, error };
}
