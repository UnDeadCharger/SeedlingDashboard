export interface SeedlingData {
  tempLvl: number;
  moistureLvl: number;
  luxLvl: number;
  shtError: boolean;
  luxError: boolean;
  waterLvl: string;
  waterLvlAlarm: boolean;
  waterRawADC: number;
  isLightOn: boolean;
  isFanOn: boolean;
  isFan2On: boolean;
  fanBoost: boolean;
  isMistingOn: boolean;
  mode: "auto" | "manual";
  phase: "germination" | "nursery" | "done";
  germRemainingSeconds: number;
  nurseryDay: number;
  isDaytime: boolean;
  fanCyclePos: number;
  germHumidAlarm: boolean;
  ntpOK: boolean;
  wifiOK: boolean;
  receivedAt: string;
}
export interface ChartDataPoint {
  hour: string; // ISO string truncated to hour, e.g. "2024-05-01T14:00:00Z"
  avgTemp: number;
  avgHumid: number;
  avgLux: number;
  lightOnPct: boolean | 1 | 0; // 0 to 1
  fanOnPct: boolean | 1 | 0; // 0 to 1
  mistOnPct: boolean | 1 | 0; // 0 to 1
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Generic async state shape — reuse in every RTK slice
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export * from "./chartTypes";
