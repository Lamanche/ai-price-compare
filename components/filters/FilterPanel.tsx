"use client";

import type { Dispatch } from "react";
import { getProviderConfig } from "@/config/providers";

const CAPABILITY_OPTIONS = [
  { key: "supportsVision", label: "Vision" },
  { key: "supportsReasoning", label: "Reasoning" },
  { key: "supportsFunctionCalling", label: "Functions" },
  { key: "supportsPromptCaching", label: "Caching" },
];

interface FilterState {
  search: string;
  providers: string[];
  capabilities: string[];
  minContext: number;
  showFree: boolean;
}

type FilterAction =
  | { type: "SET_SEARCH"; value: string }
  | { type: "TOGGLE_PROVIDER"; value: string }
  | { type: "TOGGLE_CAPABILITY"; value: string }
  | { type: "SET_MIN_CONTEXT"; value: number }
  | { type: "TOGGLE_FREE" }
  | { type: "RESET" };

interface FilterPanelProps {
  filter: FilterState;
  dispatch: Dispatch<FilterAction>;
  providers: string[];
  totalCount: number;
  filteredCount: number;
}

export default function FilterPanel({
  filter,
  dispatch,
  providers,
  totalCount,
  filteredCount,
}: FilterPanelProps) {
  const hasFilters =
    filter.search ||
    filter.providers.length > 0 ||
    filter.capabilities.length > 0 ||
    filter.minContext > 0 ||
    filter.showFree;

  return (
    <div className="flex flex-col gap-3">
      {/* Search + stats row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1" style={{ minWidth: "180px" }}>
          <label htmlFor="model-search" className="sr-only">
            Search models
          </label>
          <input
            id="model-search"
            type="search"
            value={filter.search}
            onChange={(e) => dispatch({ type: "SET_SEARCH", value: e.target.value })}
            placeholder="Search models…"
            className="w-full rounded-lg px-3 py-1.5 text-sm outline-none"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </div>

        <div className="text-xs" style={{ color: "var(--color-text-dim)" }}>
          {filteredCount.toLocaleString()} / {totalCount.toLocaleString()} models
        </div>

        {hasFilters && (
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="text-xs underline underline-offset-2 transition-colors hover:text-white"
            style={{ color: "var(--color-text-dim)" }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Capability filters */}
      <div
        role="group"
        aria-label="Filter by capability"
        className="flex flex-wrap items-center gap-2"
      >
        <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
          Capabilities:
        </span>
        {CAPABILITY_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            role="checkbox"
            aria-checked={filter.capabilities.includes(key)}
            onClick={() => dispatch({ type: "TOGGLE_CAPABILITY", value: key })}
            className="chip"
            aria-pressed={filter.capabilities.includes(key)}
          >
            {label}
          </button>
        ))}

        <span className="ml-2 text-xs" style={{ color: "var(--color-text-dim)" }}>
          |
        </span>

        {/* Free models toggle */}
        <button
          onClick={() => dispatch({ type: "TOGGLE_FREE" })}
          aria-pressed={filter.showFree}
          className="chip"
        >
          Free models
        </button>
      </div>

      {/* Provider filters */}
      {providers.length > 0 && (
        <div
          role="group"
          aria-label="Filter by provider"
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
            Providers:
          </span>
          {providers.slice(0, 10).map((p) => {
            const cfg = getProviderConfig(p);
            const active = filter.providers.includes(p);
            return (
              <button
                key={p}
                onClick={() => dispatch({ type: "TOGGLE_PROVIDER", value: p })}
                aria-pressed={active}
                className="chip"
                style={
                  active
                    ? {
                        backgroundColor: `${cfg.color}18`,
                        borderColor: `${cfg.color}60`,
                        color: cfg.color,
                      }
                    : {}
                }
              >
                {cfg.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
