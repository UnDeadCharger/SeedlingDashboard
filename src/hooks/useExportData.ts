import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/api/apiClient";

export function useExportData({
  startTime,
  endTime,
}: {
  startTime?: string;
  endTime?: string;
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        ...(startTime && { from: startTime }),
        ...(endTime && { to: endTime }),
      });

      const res = await apiClient.get(`/seedling/export?${params}`);
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [startTime, endTime]);

  useEffect(() => {
    fetchExportData();
  }, [fetchExportData]);

  return { data, loading, error };
}
