"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PriceSnapshot, UnifiedModel } from "@/lib/types";
import { getProviderConfig } from "@/config/providers";

interface PriceHistoryChartProps {
  models: UnifiedModel[];
  history: PriceSnapshot[];
  selectedIds: string[];
}

interface ChartPoint {
  date: string;
  [modelName: string]: string | number;
}

function buildChartData(
  models: UnifiedModel[],
  history: PriceSnapshot[],
  selectedIds: string[]
): ChartPoint[] {
  const selected = models.filter((m) => selectedIds.includes(m.id));
  if (!selected.length) return [];

  // Collect all dates
  const dateSet = new Set<string>();
  for (const snap of history) {
    if (selectedIds.some((id) => snap.modelId === id || snap.modelId.endsWith(`/${id.split("/")[1]}`))) {
      dateSet.add(snap.date);
    }
  }

  // Also add current prices as the most recent point
  const today = new Date().toISOString().slice(0, 10);
  dateSet.add(today);

  const dates = Array.from(dateSet).sort();

  return dates.map((date) => {
    const point: ChartPoint = { date };
    for (const model of selected) {
      const snap = history.find(
        (h) =>
          h.date === date &&
          (h.modelId === model.id || h.modelId.endsWith(`/${model.id.split("/")[1]}`))
      );
      if (snap) {
        point[model.id] = snap.inputPerMillion;
      } else if (date === today) {
        point[model.id] = model.pricing.inputPerMillion;
      }
    }
    return point;
  });
}

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

export default function PriceHistoryChart({
  models,
  history,
  selectedIds,
}: PriceHistoryChartProps) {
  const selected = models.filter((m) => selectedIds.includes(m.id));
  const data = buildChartData(models, history, selectedIds);

  if (!data.length || !selected.length) {
    return (
      <div
        className="flex h-40 items-center justify-center text-sm"
        style={{ color: "var(--color-text-dim)" }}
      >
        No historical data available for selected models
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
          Input price history ($/M tokens)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(d: string) => d.slice(5)} // "MM-DD"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            width={56}
          />
          <Tooltip
            formatter={(value, name) => [
              typeof value === "number" ? `$${value.toFixed(4)}/M` : String(value),
              models.find((m) => m.id === name)?.name ?? String(name),
            ]}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              background: "#1e1e2e",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              color: "#f1f5f9",
            }}
          />
          <Legend
            formatter={(value: string) => models.find((m) => m.id === value)?.name ?? value}
          />
          {selected.map((model, i) => (
            <Line
              key={model.id}
              type="monotone"
              dataKey={model.id}
              stroke={getProviderConfig(model.provider).color ?? COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
