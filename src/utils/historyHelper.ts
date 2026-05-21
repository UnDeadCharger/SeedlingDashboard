import { CSV_FIELDS } from "@/constants";
import dayjs from "@/utils/dayjsSetup";

import type { SeedlingData } from "@/types";

export const defaultFrom = () => dayjs().subtract(7, "day").format("YYYY-MM-DDTHH:mm");
export const defaultTo = () => dayjs().format("YYYY-MM-DDTHH:mm");
export function fmtXLabel(iso: string) {
  const d = dayjs(iso).local();
  return `${d.format("MMM D")} ${d.format("HH")}h`;
}
export function fmtXLabelCondensed(iso: string) {
  const d = dayjs(iso).local();

  return d.format("HH") === "00" ? d.format("MMM D") : `${d.format("HH")}h`;
}

export function exportToCSV(data: Partial<SeedlingData>[], filename: string) {
  const esc = (v: string | number | boolean | null | undefined) => {
    if (v == null) return "";
    if (typeof v === "boolean") return v ? "1" : "0";
    const s = String(v);
    return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    CSV_FIELDS.join(","),
    ...data.map((r) => CSV_FIELDS.map((k) => esc(r[k as keyof SeedlingData])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  Object.assign(document.createElement("a"), {
    href: url,
    download: filename,
  }).click();
  URL.revokeObjectURL(url);
}

export function filterByRange(arr: SeedlingData[], from: string, to: string) {
  const f = new Date(from).getTime();
  const t = new Date(to).getTime();
  if (Number.isNaN(f) || Number.isNaN(t) || f > t) return arr;
  return arr.filter((r) => {
    const ts = new Date(r.receivedAt).getTime();
    return ts >= f && ts <= t;
  });
}
