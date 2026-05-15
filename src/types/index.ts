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
