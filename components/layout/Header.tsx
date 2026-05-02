"use client";

import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";

interface HeaderProps {
  fetchedAt?: string;
  sourceTimestamps?: {
    openrouter: string | null;
    litellm: string | null;
    llmprices: string | null;
  };
  errorCount?: number;
}

function FreshnessIndicator({
  label,
  timestamp,
}: {
  label: string;
  timestamp: string | null;
}) {
  if (!timestamp) {
    return (
      <span className="flex items-center gap-1 text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500/70" />
        <span style={{ color: "var(--color-text-dim)" }}>{label}: unavailable</span>
      </span>
    );
  }

  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60_000);
  const label2 =
    minutes < 1 ? "now" : minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h`;
  const color = minutes < 30 ? "#22c55e" : minutes < 90 ? "#f59e0b" : "#ef4444";

  return (
    <span className="flex items-center gap-1 text-xs">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span style={{ color: "var(--color-text-muted)" }}>
        {label}{" "}
        <span style={{ color: "var(--color-text)" }}>{label2}</span>
      </span>
    </span>
  );
}

export default function Header({ fetchedAt, sourceTimestamps, errorCount = 0 }: HeaderProps) {
  return (
    <header
      style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(10,10,15,0.9)" }}
      className="sticky top-0 z-40 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          <span className="text-base font-bold" style={{ color: "#6366f1" }}>▲</span>
          {SITE_CONFIG.name}
        </Link>

        {/* Nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-5 text-xs md:flex"
          style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="transition-colors hover:text-white">Compare</Link>
          <Link href="/calculator" className="transition-colors hover:text-white">Calculator</Link>
          <Link href="/api/models" className="transition-colors hover:text-white">API</Link>
        </nav>

        {/* Freshness bar */}
        {sourceTimestamps && (
          <div
            className="hidden items-center gap-3 lg:flex"
            aria-live="polite"
            aria-label="Data freshness status"
          >
            <FreshnessIndicator label="OpenRouter" timestamp={sourceTimestamps.openrouter} />
            <FreshnessIndicator label="LiteLLM" timestamp={sourceTimestamps.litellm} />
            <FreshnessIndicator label="llm-prices" timestamp={sourceTimestamps.llmprices} />
            {errorCount > 0 && (
              <span className="text-xs" style={{ color: "#f59e0b" }}>
                ⚠ {errorCount} source{errorCount > 1 ? "s" : ""} unavailable
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
