import type { UnifiedModel } from "@/lib/types";
import { getProviderConfig } from "@/config/providers";
import { formatContextWindow } from "@/lib/formatters";
import PriceCell from "./PriceCell";
import CapabilityBadge from "./CapabilityBadge";

interface ColumnStats {
  inputMin: number; inputMax: number;
  outputMin: number; outputMax: number;
  cacheReadMin: number; cacheReadMax: number;
}

interface ModelRowProps {
  model: UnifiedModel;
  stats: ColumnStats;
}

const CAPABILITY_KEYS = [
  "supportsVision",
  "supportsReasoning",
  "supportsFunctionCalling",
  "supportsPromptCaching",
] as const;

export default function ModelRow({ model, stats }: ModelRowProps) {
  const provider = getProviderConfig(model.provider);
  const caps = model.capabilities;

  return (
    <tr
      className="border-b transition-colors hover:bg-white/[0.02]"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Model name */}
      <td className="px-3 py-2.5" scope="row">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: provider.color }}
              aria-hidden="true"
            />
            <span
              className="max-w-[200px] truncate text-xs font-medium"
              style={{ color: "var(--color-text)" }}
              title={model.name}
            >
              {model.name}
            </span>
            {model.priceVerified && (
              <span
                className="text-[10px]"
                style={{ color: "#22c55e" }}
                title="Verified by multiple sources"
                aria-label="Price verified"
              >
                ✓
              </span>
            )}
          </div>
          {/* Capability badges */}
          <div className="flex flex-wrap gap-1 pl-3.5">
            {CAPABILITY_KEYS.map(
              (k) =>
                caps[k] && (
                  <CapabilityBadge key={k} capability={k} />
                )
            )}
          </div>
        </div>
      </td>

      {/* Provider */}
      <td className="hidden px-3 py-2.5 sm:table-cell">
        <span className="text-xs" style={{ color: provider.color }}>
          {provider.name}
        </span>
      </td>

      {/* Input */}
      <td className="px-3 py-2.5 text-right">
        <PriceCell
          value={model.pricing.inputPerMillion}
          columnMin={stats.inputMin}
          columnMax={stats.inputMax}
        />
      </td>

      {/* Output */}
      <td className="px-3 py-2.5 text-right">
        <PriceCell
          value={model.pricing.outputPerMillion}
          columnMin={stats.outputMin}
          columnMax={stats.outputMax}
        />
      </td>

      {/* Cache Read */}
      <td className="hidden px-3 py-2.5 text-right lg:table-cell">
        <PriceCell
          value={model.pricing.cacheReadPerMillion}
          columnMin={stats.cacheReadMin}
          columnMax={stats.cacheReadMax}
        />
      </td>

      {/* Cache Write */}
      <td className="hidden px-3 py-2.5 text-right lg:table-cell">
        <PriceCell value={model.pricing.cacheWritePerMillion} />
      </td>

      {/* Context */}
      <td className="hidden px-3 py-2.5 text-right md:table-cell">
        <span className="tabular text-xs" style={{ color: "var(--color-text-muted)" }}>
          {formatContextWindow(model.contextWindow)}
        </span>
      </td>

      {/* Sources */}
      <td className="hidden px-3 py-2.5 xl:table-cell">
        <div className="flex gap-1">
          {model.sources.map((s) => (
            <span
              key={s}
              className="rounded px-1 py-0.5 text-[9px] font-medium uppercase"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                color: "var(--color-text-dim)",
              }}
              title={s}
            >
              {s === "openrouter" ? "OR" : s === "litellm" ? "LL" : "LP"}
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
}
