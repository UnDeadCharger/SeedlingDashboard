import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_COLORS } from "@/constants";
import { fmtXLabel } from "@/utils/historyHelper";

import ChartTooltip from "./ChartTooltip";
import EmptyState from "./EmptyState";

import type { ChartDataPoint, avgTypes } from "@/types";
type CombinedSensorChartProps = {
  data: ChartDataPoint[];
  visible: {
    avgTemp: boolean;
    avgHumid: boolean;
    avgLux: boolean;
  };
  onToggle: (key: "avgTemp" | "avgHumid" | "avgLux") => void;
};

function CombinedSensorChart({ data, visible, onToggle }: CombinedSensorChartProps) {
  const interval = Math.max(1, Math.floor(data.length / 12));
  const toggleDefs: {
    key: keyof typeof avgTypes;
    label: string;
    color: string;
  }[] = [
    { key: "avgTemp", label: "Temp °C", color: CHART_COLORS.temp },
    { key: "avgHumid", label: "Humid %", color: CHART_COLORS.humid },
    { key: "avgLux", label: "Lux", color: CHART_COLORS.lux },
  ];

  return (
    <div className="chart-card">
      <div className="chart-title">
        <span>📊 Sensor Overview — Hourly Average</span>
        <div className="line-toggles">
          {toggleDefs.map(({ key, label, color }) => (
            <button
              type="button"
              key={key}
              className="line-toggle"
              onClick={() => onToggle(key)}
              style={{
                borderColor: visible[key] ? color : "var(--bdr)",
                color: visible[key] ? color : "var(--text-m)",
                background: visible[key] ? `${color}18` : "transparent",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 2,
                  background: visible[key] ? color : "var(--bdr)",
                  display: "inline-block",
                  borderRadius: 1,
                }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>
      {data.length === 0 ? (
        <EmptyState small={undefined} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 4, right: 60, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c3d28" />
            <XAxis
              dataKey="hour"
              tickFormatter={fmtXLabel}
              interval={interval}
              tick={{ fill: "#5d9970", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#1c3d28" }}
            />
            <YAxis
              yAxisId="lr"
              tick={{ fill: "#5d9970", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <YAxis
              yAxisId="lux"
              orientation="right"
              tick={{ fill: "#5d9970", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
            <Tooltip
              content={
                <ChartTooltip
                  active={undefined}
                  payload={undefined}
                  label={undefined}
                  pctMode={undefined}
                />
              }
            />
            {visible.avgTemp && (
              <Line
                yAxisId="lr"
                type="monotone"
                dataKey="avgTemp"
                stroke={CHART_COLORS.temp}
                dot={false}
                strokeWidth={2}
                name="Temp (°C)"
              />
            )}
            {visible.avgHumid && (
              <Line
                yAxisId="lr"
                type="monotone"
                dataKey="avgHumid"
                stroke={CHART_COLORS.humid}
                dot={false}
                strokeWidth={2}
                name="Humid (%)"
              />
            )}
            {visible.avgLux && (
              <Line
                yAxisId="lux"
                type="monotone"
                dataKey="avgLux"
                stroke={CHART_COLORS.lux}
                dot={false}
                strokeWidth={2}
                name="Lux"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default CombinedSensorChart;
