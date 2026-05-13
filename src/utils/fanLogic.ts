import { FAN_CYCLE_MIN, FAN_NIGHT_ON_MIN } from "@/constants";

import type { SeedlingData } from "@/types";

/** Derive fan operating context from data fields */
export function getFanContext(data: SeedlingData) {
  const { phase, isDaytime, isFanOn, mode, fanBoost } = data;

  // Germination: firmware hardware-locks fans OFF regardless of isFanOn
  if (phase === "germination")
    return {
      tag: "germ",
      label: "Disabled",
      detail: "Locked off during germination (24 h)",
      effectiveOn: false,
    };

  if (mode === "manual")
    return {
      tag: "manual",
      label: "Manual Timer",
      detail: isFanOn ? "Running on manual timer" : "Timer not set / expired",
      effectiveOn: isFanOn,
    };

  // Auto, nursery / done
  if (fanBoost)
    return {
      tag: "boost",
      label: "Boost Active",
      detail: "Humidity > 95% or Temp > 30 °C override",
      effectiveOn: true,
    };

  if (isDaytime)
    return {
      tag: "day",
      label: "Day Schedule",
      detail: "Continuous — 06:00 to 18:00",
      effectiveOn: isFanOn,
    };

  return {
    tag: "night",
    label: "Night Cycle",
    detail: `${FAN_NIGHT_ON_MIN} min ON / ${FAN_CYCLE_MIN - FAN_NIGHT_ON_MIN} min OFF`,
    effectiveOn: isFanOn,
  };
}
