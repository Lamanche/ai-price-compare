import { formatPricePerMillion } from "@/lib/formatters";

interface PriceCellProps {
  value: number | null;
  columnMin?: number;
  columnMax?: number;
  suffix?: string;
}

function getColor(value: number, min: number, max: number): string | undefined {
  if (max === min) return undefined;
  const pct = (value - min) / (max - min);
  if (pct <= 0.2) return "#22c55e"; // cheapest
  if (pct >= 0.8) return "#ef4444"; // most expensive
  return undefined;
}

export default function PriceCell({ value, columnMin, columnMax, suffix = "/M" }: PriceCellProps) {
  if (value === null) {
    return (
      <span style={{ color: "var(--color-text-dim)" }} aria-label="Not available">
        —
      </span>
    );
  }

  const color =
    columnMin !== undefined && columnMax !== undefined
      ? getColor(value, columnMin, columnMax)
      : undefined;

  return (
    <span
      className="tabular font-mono text-xs"
      style={{ color: color ?? "var(--color-text)" }}
      title={`$${value.toFixed(6)} per million tokens`}
    >
      {formatPricePerMillion(value)}
      <span style={{ color: "var(--color-text-dim)", fontSize: "0.65rem" }}>{suffix}</span>
    </span>
  );
}
