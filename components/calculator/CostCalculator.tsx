"use client";

import { useState, useMemo } from "react";
import type { UnifiedModel } from "@/lib/types";
import { getProviderConfig } from "@/config/providers";
import { formatPricePerMillion } from "@/lib/formatters";

interface CalcState {
  inputTokens: number;
  outputTokens: number;
  cachedPercent: number;
  cacheWriteRatio: number;
  batchPercent: number;
}

function computeCost(model: UnifiedModel, state: CalcState): number {
  const { inputTokens, outputTokens, cachedPercent, cacheWriteRatio, batchPercent } = state;
  const { inputPerMillion, outputPerMillion, cacheReadPerMillion, cacheWritePerMillion } =
    model.pricing;

  const M = 1_000_000;
  const effective = inputTokens * (1 - cachedPercent);
  const cachedWrite = inputTokens * cachedPercent * cacheWriteRatio;
  const cachedRead = inputTokens * cachedPercent * (1 - cacheWriteRatio);

  const cacheWriteRate = cacheWritePerMillion ?? inputPerMillion;
  const cacheReadRate = cacheReadPerMillion ?? inputPerMillion;

  let cost =
    (effective * inputPerMillion) / M +
    (cachedWrite * cacheWriteRate) / M +
    (cachedRead * cacheReadRate) / M +
    (outputTokens * outputPerMillion) / M;

  // Batch discount: 50% off the batched portion
  if (batchPercent > 0) {
    cost = cost * (1 - batchPercent * 0.5);
  }

  return cost;
}

interface RangeInputProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

function RangeInput({ id, label, value, min, max, step, format, onChange }: RangeInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </label>
        <span className="tabular text-xs font-semibold" style={{ color: "var(--color-text)" }}>
          {format(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-500"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format(value)}
      />
    </div>
  );
}

function NumberInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={value}
        min={0}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="rounded-lg px-3 py-1.5 text-sm tabular outline-none"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
        }}
      />
    </div>
  );
}

export default function CostCalculator({ models }: { models: UnifiedModel[] }) {
  const [state, setState] = useState<CalcState>({
    inputTokens: 1_000_000,
    outputTokens: 100_000,
    cachedPercent: 0.3,
    cacheWriteRatio: 0.1,
    batchPercent: 0,
  });

  function set<K extends keyof CalcState>(key: K) {
    return (v: number) => setState((s) => ({ ...s, [key]: v }));
  }

  const results = useMemo(() => {
    return models
      .map((m) => ({ model: m, cost: computeCost(m, state) }))
      .sort((a, b) => a.cost - b.cost)
      .slice(0, 25);
  }, [models, state]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Controls */}
      <div className="card flex flex-col gap-5 p-5 lg:w-72 lg:shrink-0">
        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          Usage Parameters
        </h2>

        <NumberInput
          id="input-tokens"
          label="Input tokens / month"
          value={state.inputTokens}
          onChange={set("inputTokens")}
        />
        <NumberInput
          id="output-tokens"
          label="Output tokens / month"
          value={state.outputTokens}
          onChange={set("outputTokens")}
        />

        <div style={{ borderTop: "1px solid var(--color-border)" }} className="pt-4">
          <h3 className="mb-3 text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
            Prompt Caching
          </h3>
          <div className="flex flex-col gap-3">
            <RangeInput
              id="cached-pct"
              label="% of input cached"
              value={state.cachedPercent}
              min={0}
              max={1}
              step={0.05}
              format={(v) => `${(v * 100).toFixed(0)}%`}
              onChange={set("cachedPercent")}
            />
            {state.cachedPercent > 0 && (
              <RangeInput
                id="cache-write-ratio"
                label="Cache write vs read ratio"
                value={state.cacheWriteRatio}
                min={0}
                max={1}
                step={0.05}
                format={(v) => `${(v * 100).toFixed(0)}% writes`}
                onChange={set("cacheWriteRatio")}
              />
            )}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--color-border)" }} className="pt-4">
          <h3 className="mb-3 text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
            Batch API
          </h3>
          <RangeInput
            id="batch-pct"
            label="% sent as batch (50% discount)"
            value={state.batchPercent}
            min={0}
            max={1}
            step={0.05}
            format={(v) => `${(v * 100).toFixed(0)}%`}
            onChange={set("batchPercent")}
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1">
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--color-border)" }}>
          <table
            className="w-full border-collapse"
            aria-label="Estimated monthly cost by model"
            aria-live="polite"
          >
            <caption className="sr-only">
              Ranked AI models by estimated monthly cost based on your usage parameters.
            </caption>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--color-border-mid)",
                  backgroundColor: "rgba(255,255,255,0.02)",
                }}
              >
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                  Rank
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                  Model
                </th>
                <th scope="col" className="px-3 py-2 text-right text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                  Est. Monthly Cost
                </th>
                <th scope="col" className="hidden px-3 py-2 text-right text-xs font-medium sm:table-cell" style={{ color: "var(--color-text-muted)" }}>
                  Input $/M
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map(({ model, cost }, i) => {
                const provider = getProviderConfig(model.provider);
                return (
                  <tr
                    key={model.id}
                    className="border-b transition-colors hover:bg-white/[0.02]"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <td className="px-3 py-2.5">
                      <span className="tabular text-xs" style={{ color: "var(--color-text-dim)" }}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: provider.color }}
                        />
                        <span className="text-xs font-medium" style={{ color: "var(--color-text)" }}>
                          {model.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span
                        className="tabular font-mono text-sm font-semibold"
                        style={{ color: i === 0 ? "#22c55e" : "var(--color-text)" }}
                      >
                        ${cost.toFixed(cost < 0.01 ? 6 : cost < 1 ? 4 : 2)}
                      </span>
                    </td>
                    <td className="hidden px-3 py-2.5 text-right sm:table-cell">
                      <span className="tabular text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {formatPricePerMillion(model.pricing.inputPerMillion)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--color-text-dim)" }}>
          Estimates based on your inputs. Actual costs may vary. Caching and batch availability differs by model.
        </p>
      </div>
    </div>
  );
}
