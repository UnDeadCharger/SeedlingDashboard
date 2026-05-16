import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fmtXLabel } from "@/utils/historyHelper";

import ChartTooltip from "./ChartTooltip";
import EmptyState from "./EmptyState";

import type { ChartDataPoint } from "@/types";
function ActuatorChart({ data }: { data: ChartDataPoint[] }) {
  const interval = Math.max(1, Math.floor(data.length / 12));
  return (
    <div className="chart-card">
      <div className="chart-title">⚡ Device Activity — % time ON per hour</div>
      {data.length === 0 ? (
        <EmptyState small={undefined} />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {[
                ["light", "#f5a623"],
                ["fan", "#3ddc7a"],
                ["mist", "#4fc3f7"],
              ].map(([k, c]) => (
                <linearGradient key={k} id={`ga-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={c} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
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
              domain={[0, 1]}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              tick={{ fill: "#5d9970", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              content={
                <ChartTooltip pctMode active={undefined} payload={undefined} label={undefined} />
              }
            />
            <Legend
              wrapperStyle={{
                color: "#5d9970",
                fontSize: "0.72rem",
                paddingTop: 10,
              }}
            />
            <Area
              type="monotone"
              dataKey="lightOnPct"
              stroke="#f5a623"
              fill="url(#ga-light)"
              dot={false}
              strokeWidth={2}
              name="Grow Light"
            />
            <Area
              type="monotone"
              dataKey="fanOnPct"
              stroke="#3ddc7a"
              fill="url(#ga-fan)"
              dot={false}
              strokeWidth={2}
              name="Fan"
            />
            <Area
              type="monotone"
              dataKey="mistOnPct"
              stroke="#4fc3f7"
              fill="url(#ga-mist)"
              dot={false}
              strokeWidth={2}
              name="Misting"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ActuatorChart;
