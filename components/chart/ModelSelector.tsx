"use client";

import type { UnifiedModel } from "@/lib/types";
import { getProviderConfig } from "@/config/providers";

interface ModelSelectorProps {
  models: UnifiedModel[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  max?: number;
}

export default function ModelSelector({
  models,
  selectedIds,
  onChange,
  max = 3,
}: ModelSelectorProps) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else if (selectedIds.length < max) {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div
      role="group"
      aria-label="Select models to compare on chart (up to 3)"
      className="flex flex-wrap gap-2"
    >
      {models.map((model) => {
        const active = selectedIds.includes(model.id);
        const provider = getProviderConfig(model.provider);
        const disabled = !active && selectedIds.length >= max;

        return (
          <button
            key={model.id}
            onClick={() => toggle(model.id)}
            aria-pressed={active}
            disabled={disabled}
            className="chip transition-all"
            style={
              active
                ? {
                    backgroundColor: `${provider.color}22`,
                    borderColor: `${provider.color}88`,
                    color: provider.color,
                  }
                : {}
            }
          >
            {model.name}
          </button>
        );
      })}
      {selectedIds.length >= max && (
        <span className="self-center text-xs" style={{ color: "var(--color-text-dim)" }}>
          Max {max} selected
        </span>
      )}
    </div>
  );
}
