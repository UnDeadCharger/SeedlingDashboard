import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fmtXLabel } from "@/utils/historyHelper";

import ChartTooltip from "./ChartTooltip";
import EmptyState from "./EmptyState";

import type { ChartDataPoint, avgTypes } from "@/types";
type IndividualChartProps = {
  data: ChartDataPoint[];
  dataKey: keyof typeof avgTypes;
  title: string;
  color: string;
  unit: string;
  yDomain: [number | "auto", number | "auto"];
};

function IndividualChart({ data, dataKey, title, color, unit, yDomain }: IndividualChartProps) {
  const interval = Math.max(1, Math.floor(data.length / 8));
  const gradId = `grad-${dataKey}`;
  console.log("Rendering IndividualChart", {
    dataKey,
    dataLength: data.length,
    yDomain,
  });
  return (
    <div className="chart-card">
      <div className="chart-title" style={{ color }}>
        {title}
      </div>
      {data.length === 0 ? (
        <EmptyState small />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.28} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c3d28" />
            <XAxis
              dataKey="hour"
              tickFormatter={fmtXLabel}
              interval={interval}
              tick={{ fill: "#5d9970", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "#1c3d28" }}
            />
            <YAxis
              domain={yDomain}
              tick={{ fill: "#5d9970", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v) => `${v}${unit}`}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={`url(#${gradId})`}
              dot={false}
              strokeWidth={2}
              name={title.replace(/^[^ ]+ /, "")}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default IndividualChart;
