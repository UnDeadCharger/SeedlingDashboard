import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/api/apiClient";

import type { SeedlingData } from "@/types";
type BooleanSeedlingField = {
  [Key in keyof SeedlingData]: SeedlingData[Key] extends boolean ? Key : never;
}[keyof SeedlingData];

const BOOLEAN_FIELDS: BooleanSeedlingField[] = [
  "shtError",
  "luxError",
  "waterLvlAlarm",
  "isLightOn",
  "isFanOn",
  "isFan2On",
  "fanBoost",
  "isMistingOn",
  "isDaytime",
  "germHumidAlarm",
  "ntpOK",
  "wifiOK",
];

function normalizeSeedlingData(rawData: Record<string, unknown>): SeedlingData {
  const normalizedData = { ...rawData };

  for (const field of BOOLEAN_FIELDS) {
    const value = normalizedData[field];

    if (value === 0 || value === 1) {
      normalizedData[field] = Boolean(value);
    }
  }

  return normalizedData as unknown as SeedlingData;
}

/**
 * Polls GET /api/seedling on a fixed interval and returns live data.
 *
 * @param {string}  url            – your API endpoint
 * @param {number}  intervalMs     – polling interval in ms (default 3000)
 * @returns {{
 *   data:    object|null,   – latest parsed response body
 *   loading: boolean,       – true only on the very first fetch
 *   error:   string|null,   – last error message, null if OK
 *   refetch: () => void,    – call to trigger an immediate re-fetch
 * }}
 *
 * Usage:
 *   const { data, loading, error } = useSeedlingData("/api/seedling");
 */
export function useSeedlingData(intervalMs = 3000) {
  const [data, setData] = useState<SeedlingData | undefined>(undefined);
  const [loading, setLoading] = useState(true); // true only on first load
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchData = useCallback(async () => {
    try {
      const res = await apiClient.get("/seedling/latest");
      setData(normalizeSeedlingData(res.data));
      setError(undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch seedling data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling interval
  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => clearInterval(id);
  }, [fetchData, intervalMs]);

  return { data, loading, error, refetch: fetchData };
}
