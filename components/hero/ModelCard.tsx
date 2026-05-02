"use client";

import { useState } from "react";
import type { UnifiedModel, PriceSnapshot } from "@/lib/types";
import { getProviderConfig } from "@/config/providers";
import { formatPricePerMillion } from "@/lib/formatters";
import PriceDelta from "./PriceDelta";

interface ModelCardProps {
  model: UnifiedModel;
  history: PriceSnapshot[];
  onChartClick: (modelId: string) => void;
  isChartOpen: boolean;
}

function computeDelta(
  current: number,
  history: PriceSnapshot[],
  modelId: string
): number | null {
  const snapshots = history
    .filter((h) => h.modelId === modelId || h.modelId.endsWith(`/${modelId.split("/")[1]}`))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (snapshots.length < 2) return null;
  const oldest = snapshots[0].inputPerMillion;
  if (oldest === 0) return null;
  return ((current - oldest) / oldest) * 100;
}

export default function ModelCard({
  model,
  history,
  onChartClick,
  isChartOpen,
}: ModelCardProps) {
  const provider = getProviderConfig(model.provider);
  const delta = computeDelta(model.pricing.inputPerMillion, history, model.id);

  return (
    <div
      className="card flex flex-col gap-3 p-5 transition-all duration-200 hover:border-white/20"
      style={{ borderTop: `2px solid ${provider.color}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium" style={{ color: provider.color }}>
            {provider.name}
          </p>
          <h3
            className="truncate text-sm font-semibold leading-tight"
            style={{ color: "var(--color-text)" }}
            title={model.name}
          >
            {model.name}
          </h3>
        </div>
        {model.priceVerified && (
          <span
            className="shrink-0 text-xs"
            style={{ color: "#22c55e" }}
            title="Price confirmed by multiple sources"
            aria-label="Price verified by multiple sources"
          >
            ✓
          </span>
        )}
      </div>

      {/* Prices */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Input
          </span>
          <div className="flex items-center gap-2">
            <PriceDelta pct={delta} />
            <span
              className="tabular font-mono text-sm font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              {formatPricePerMillion(model.pricing.inputPerMillion)}/M
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Output
          </span>
          <span
            className="tabular font-mono text-sm font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            {formatPricePerMillion(model.pricing.outputPerMillion)}/M
          </span>
        </div>

        {model.pricing.cacheReadPerMillion !== null && (
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Cache Read
            </span>
            <span
              className="tabular font-mono text-sm font-semibold"
              style={{ color: "var(--color-text-muted)" }}
            >
              {formatPricePerMillion(model.pricing.cacheReadPerMillion)}/M
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-1"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
          {model.contextWindow
            ? `${(model.contextWindow / 1000).toFixed(0)}K ctx`
            : ""}
        </span>
        <button
          onClick={() => onChartClick(model.id)}
          aria-expanded={isChartOpen}
          aria-label={`${isChartOpen ? "Hide" : "Show"} price history for ${model.name}`}
          className="text-xs underline underline-offset-2 transition-colors hover:text-white"
          style={{ color: "var(--color-text-dim)" }}
        >
          {isChartOpen ? "Hide chart" : "Chart ↓"}
        </button>
      </div>
    </div>
  );
}
