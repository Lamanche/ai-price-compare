"use client";

interface ViewToggleProps {
  view: "users" | "devs";
  onChange: (v: "users" | "devs") => void;
}

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Select view mode"
      className="inline-flex rounded-lg p-0.5"
      style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)" }}
    >
      {(["users", "devs"] as const).map((v) => {
        const active = view === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            aria-pressed={active}
            className="rounded-md px-4 py-1.5 text-xs font-medium transition-all duration-150"
            style={{
              backgroundColor: active ? "rgba(99,102,241,0.25)" : "transparent",
              color: active ? "#a5b4fc" : "var(--color-text-muted)",
              border: active ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
            }}
          >
            {v === "users" ? "For Users" : "For Developers"}
          </button>
        );
      })}
    </div>
  );
}
