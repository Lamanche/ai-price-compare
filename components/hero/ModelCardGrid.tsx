"use client";

import { useState } from "react";
import type { UnifiedModel, PriceSnapshot } from "@/lib/types";
import { HERO_MODEL_IDS } from "@/config/hero-models";
import ModelCard from "./ModelCard";
import ChartPanel from "@/components/chart/ChartPanel";

interface ModelCardGridProps {
  models: UnifiedModel[];
  history: PriceSnapshot[];
}

export default function ModelCardGrid({ models, history }: ModelCardGridProps) {
  const [openChartId, setOpenChartId] = useState<string | null>(null);

  const heroModels = HERO_MODEL_IDS
    .map((id) => models.find((m) => m.id === id))
    .filter((m): m is UnifiedModel => m !== undefined);

  if (!heroModels.length) return null;

  function toggleChart(id: string) {
    setOpenChartId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {heroModels.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            history={history}
            onChartClick={toggleChart}
            isChartOpen={openChartId === model.id}
          />
        ))}
      </div>

      {/* Expandable chart panel */}
      <ChartPanel
        openModelId={openChartId}
        models={heroModels}
        history={history}
      />
    </div>
  );
}
