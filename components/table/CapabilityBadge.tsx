const LABELS: Record<string, string> = {
  supportsVision: "Vision",
  supportsReasoning: "Reasoning",
  supportsFunctionCalling: "Functions",
  supportsPromptCaching: "Caching",
  supportsResponseSchema: "Schema",
};

const COLORS: Record<string, string> = {
  supportsVision: "#3b82f6",
  supportsReasoning: "#8b5cf6",
  supportsFunctionCalling: "#10b981",
  supportsPromptCaching: "#f59e0b",
  supportsResponseSchema: "#06b6d4",
};

interface CapabilityBadgeProps {
  capability: string;
}

export default function CapabilityBadge({ capability }: CapabilityBadgeProps) {
  const label = LABELS[capability] ?? capability;
  const color = COLORS[capability] ?? "#94a3b8";

  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}40`,
      }}
      title={label}
      aria-label={label}
    >
      {label}
    </span>
  );
}
