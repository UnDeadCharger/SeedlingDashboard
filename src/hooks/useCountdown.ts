import { useEffect, useState } from "react";

/**
 * Syncs to an external `initialSeconds` value (from API polling) and
 * ticks it down by 1 every second while `active` is true.
 *
 * The external value always wins — whenever `initialSeconds` changes
 * (e.g. a fresh API response arrives) the countdown resets to that value.
 *
 * @param {number}  initialSeconds  – germRemainingSeconds from API
 * @param {boolean} active          – should the clock be ticking?
 *                                   Pass: phase === "germination" && initialSeconds > 0
 * @returns {number} remaining seconds
 *
 * Usage:
 *   const secs = useCountdown(data.germRemainingSeconds, data.phase === "germination");
 *   const { d, h, m, s } = fmtCountdown(secs);
 */
export function useCountdown(initialSeconds: number, active: boolean) {
  const [secs, setSecs] = useState(initialSeconds ?? 0);

  // Whenever the API gives us a fresh value, snap to it
  useEffect(() => {
    setSecs(initialSeconds ?? 0);
  }, [initialSeconds]);

  // Tick down every second only while active
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!active || secs <= 0) return;
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [active, secs <= 0]); // eslint-disable-line react-hooks/exhaustive-deps

  return secs;
}
