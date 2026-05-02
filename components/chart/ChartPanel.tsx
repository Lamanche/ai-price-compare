"use client";

import { useState, useEffect } from "react";
import type { UnifiedModel, PriceSnapshot } from "@/lib/types";
import PriceHistoryChart from "./PriceHistoryChart";
import ModelSelector from "./ModelSelector";

interface ChartPanelProps {
  openModelId: string | null;
  models: UnifiedModel[];
  history: PriceSnapshot[];
}

export default function ChartPanel({ openModelId, models, history }: ChartPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // When a new model card is opened, add it to the selection
  useEffect(() => {
    if (openModelId && !selectedIds.includes(openModelId)) {
      setSelectedIds((prev) => {
        const next = [openModelId, ...prev].slice(0, 3);
        return next;
      });
    }
  }, [openModelId]); // eslint-disable-line react-hooks/exhaustive-deps

  const isOpen = openModelId !== null;

  return (
    <div className={`grid-rows-expand ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            Price History
          </h3>
          <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
            Compare up to 3 models
          </span>
        </div>

        <ModelSelector
          models={models}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
        />

        <div className="mt-4">
          <PriceHistoryChart
            models={models}
            history={history}
            selectedIds={selectedIds}
          />
        </div>
      </div>
    </div>
  );
}
