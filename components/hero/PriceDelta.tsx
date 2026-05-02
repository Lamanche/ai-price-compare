interface PriceDeltaProps {
  pct: number | null;
  className?: string;
}

export default function PriceDelta({ pct, className = "" }: PriceDeltaProps) {
  if (pct === null) return null;

  const isUp = pct > 0;
  const isDown = pct < 0;
  const isNeutral = pct === 0;

  const color = isUp ? "#ef4444" : isDown ? "#22c55e" : "#94a3b8";
  const arrow = isUp ? "▲" : isDown ? "▼" : "━";
  const sign = isUp ? "+" : "";

  return (
    <span
      className={`tabular inline-flex items-center gap-0.5 text-xs font-medium ${className}`}
      style={{ color }}
      aria-label={`${sign}${pct.toFixed(1)}% price change`}
    >
      <span aria-hidden="true">{arrow}</span>
      {!isNeutral && (
        <span>
          {sign}{Math.abs(pct).toFixed(1)}%
        </span>
      )}
    </span>
  );
}
