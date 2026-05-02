"use client";

import { useState, useMemo, useReducer } from "react";
import type { UnifiedModel } from "@/lib/types";
import { SITE_CONFIG } from "@/config/site";
import ModelRow from "./ModelRow";
import ColumnHeader from "./ColumnHeader";
import FilterPanel from "@/components/filters/FilterPanel";

type SortKey =
  | "name"
  | "provider"
  | "inputPerMillion"
  | "outputPerMillion"
  | "cacheReadPerMillion"
  | "contextWindow";

interface SortState {
  key: SortKey;
  dir: "asc" | "desc";
}

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

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_SEARCH": return { ...state, search: action.value };
    case "TOGGLE_PROVIDER":
      return {
        ...state,
        providers: state.providers.includes(action.value)
          ? state.providers.filter((p) => p !== action.value)
          : [...state.providers, action.value],
      };
    case "TOGGLE_CAPABILITY":
      return {
        ...state,
        capabilities: state.capabilities.includes(action.value)
          ? state.capabilities.filter((c) => c !== action.value)
          : [...state.capabilities, action.value],
      };
    case "SET_MIN_CONTEXT": return { ...state, minContext: action.value };
    case "TOGGLE_FREE": return { ...state, showFree: !state.showFree };
    case "RESET":
      return { search: "", providers: [], capabilities: [], minContext: 0, showFree: false };
  }
}

function getValue(model: UnifiedModel, key: SortKey): number | string {
  switch (key) {
    case "name": return model.name;
    case "provider": return model.provider;
    case "inputPerMillion": return model.pricing.inputPerMillion;
    case "outputPerMillion": return model.pricing.outputPerMillion;
    case "cacheReadPerMillion": return model.pricing.cacheReadPerMillion ?? Infinity;
    case "contextWindow": return model.contextWindow ?? 0;
  }
}

interface ModelTableClientProps {
  models: UnifiedModel[];
}

const CAP_KEYS = [
  "supportsVision",
  "supportsReasoning",
  "supportsFunctionCalling",
  "supportsPromptCaching",
] as const;

export default function ModelTableClient({ models }: ModelTableClientProps) {
  const [sort, setSort] = useState<SortState>({ key: "inputPerMillion", dir: "asc" });
  const [filter, dispatch] = useReducer(filterReducer, {
    search: "",
    providers: [],
    capabilities: [],
    minContext: 0,
    showFree: SITE_CONFIG.showFreeModels,
  });
  const [showRows, setShowRows] = useState<number>(SITE_CONFIG.defaultTableRows);

  const providers = useMemo(
    () => [...new Set(models.map((m) => m.provider))].sort(),
    [models]
  );

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  }

  const filtered = useMemo(() => {
    let result = models;

    if (!filter.showFree) result = result.filter((m) => !m.isFree);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)
      );
    }
    if (filter.providers.length) {
      result = result.filter((m) => filter.providers.includes(m.provider));
    }
    if (filter.capabilities.length) {
      result = result.filter((m) =>
        filter.capabilities.every(
          (cap) => m.capabilities[cap as keyof typeof m.capabilities]
        )
      );
    }
    if (filter.minContext > 0) {
      result = result.filter((m) => (m.contextWindow ?? 0) >= filter.minContext);
    }

    return result;
  }, [models, filter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = getValue(a, sort.key);
      const bv = getValue(b, sort.key);
      if (typeof av === "string" && typeof bv === "string") {
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const diff = (av as number) - (bv as number);
      return sort.dir === "asc" ? diff : -diff;
    });
  }, [filtered, sort]);

  // Column stats for color coding
  const stats = useMemo(() => {
    const vals = sorted.filter((m) => !m.isFree);
    const inputs = vals.map((m) => m.pricing.inputPerMillion);
    const outputs = vals.map((m) => m.pricing.outputPerMillion);
    const reads = vals.map((m) => m.pricing.cacheReadPerMillion).filter((v): v is number => v !== null);

    return {
      inputMin: Math.min(...inputs, Infinity),
      inputMax: Math.max(...inputs, 0),
      outputMin: Math.min(...outputs, Infinity),
      outputMax: Math.max(...outputs, 0),
      cacheReadMin: Math.min(...reads, Infinity),
      cacheReadMax: Math.max(...reads, 0),
    };
  }, [sorted]);

  const visible = sorted.slice(0, showRows);
  const hasMore = sorted.length > showRows;

  return (
    <div className="flex flex-col gap-4">
      <FilterPanel
        filter={filter}
        dispatch={dispatch}
        providers={providers}
        totalCount={models.length}
        filteredCount={filtered.length}
      />

      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--color-border)" }}>
        <table className="w-full border-collapse" role="table" aria-label="AI model pricing comparison">
          <caption className="sr-only">
            AI model API pricing comparison table. {filtered.length} models shown. Sorted by{" "}
            {sort.key} {sort.dir}ending.
          </caption>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border-mid)", backgroundColor: "rgba(255,255,255,0.02)" }}>
              <ColumnHeader label="Model" sortKey="name" currentSort={sort.key} direction={sort.dir} onSort={(k) => toggleSort(k as SortKey)} />
              <ColumnHeader label="Provider" sortKey="provider" currentSort={sort.key} direction={sort.dir} onSort={(k) => toggleSort(k as SortKey)} className="hidden sm:table-cell" />
              <ColumnHeader label="Input $/M" sortKey="inputPerMillion" currentSort={sort.key} direction={sort.dir} onSort={(k) => toggleSort(k as SortKey)} className="text-right" title="Input token cost per million tokens" />
              <ColumnHeader label="Output $/M" sortKey="outputPerMillion" currentSort={sort.key} direction={sort.dir} onSort={(k) => toggleSort(k as SortKey)} className="text-right" title="Output token cost per million tokens" />
              <ColumnHeader label="Cache R" currentSort={sort.key} sortKey="cacheReadPerMillion" direction={sort.dir} onSort={(k) => toggleSort(k as SortKey)} className="hidden text-right lg:table-cell" title="Cache read cost per million tokens" />
              <ColumnHeader label="Cache W" className="hidden text-right lg:table-cell" title="Cache write cost per million tokens" />
              <ColumnHeader label="Context" sortKey="contextWindow" currentSort={sort.key} direction={sort.dir} onSort={(k) => toggleSort(k as SortKey)} className="hidden text-right md:table-cell" />
              <ColumnHeader label="Sources" className="hidden xl:table-cell" title="Data sources that confirmed this model" />
            </tr>
          </thead>
          <tbody>
            {visible.map((model) => (
              <ModelRow key={model.id} model={model} stats={stats} />
            ))}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-10 text-center text-sm"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  No models match your filters.{" "}
                  <button
                    onClick={() => dispatch({ type: "RESET" })}
                    className="underline hover:text-white"
                  >
                    Reset filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setShowRows((n) => n + 50)}
            className="rounded-lg px-5 py-2 text-sm transition-colors hover:text-white"
            style={{
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            Show more ({sorted.length - showRows} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
