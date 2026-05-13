import type { WATER_THEME } from "@/constants";

export const pad = (n: number) => String(n).padStart(2, "0");

export function fmtCountdown(t: number) {
  const d = Math.floor(t / 86400);
  const h = Math.floor((t % 86400) / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return { d, h, m, s };
}

/** Normalize waterLvl — firmware sends "Under ", "Over  " with trailing spaces */
export const normalizeWater = (v = "Normal") => v.trim() as keyof typeof WATER_THEME;
