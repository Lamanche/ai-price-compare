export function formatPrice(value: number | null, decimals?: number): string {
  if (value === null) return "—";
  if (value === 0) return "Free";

  const abs = Math.abs(value);
  let d = decimals;
  if (d === undefined) {
    if (abs >= 100) d = 0;
    else if (abs >= 10) d = 2;
    else if (abs >= 1) d = 2;
    else if (abs >= 0.1) d = 3;
    else d = 4;
  }

  return `$${value.toFixed(d)}`;
}

export function formatPricePerMillion(value: number | null): string {
  return formatPrice(value);
}

export function formatContextWindow(tokens: number | null): string {
  if (tokens === null) return "—";
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(0)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return String(tokens);
}

export function formatRelativeTime(isoTimestamp: string | null): string {
  if (!isoTimestamp) return "unavailable";
  const diff = Date.now() - new Date(isoTimestamp).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDelta(pct: number | null): string {
  if (pct === null) return "";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}
