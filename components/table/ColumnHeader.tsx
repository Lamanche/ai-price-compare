"use client";

type SortDirection = "asc" | "desc" | "none";

interface ColumnHeaderProps {
  label: string;
  sortKey?: string;
  currentSort?: string;
  direction?: SortDirection;
  onSort?: (key: string) => void;
  title?: string;
  className?: string;
}

export default function ColumnHeader({
  label,
  sortKey,
  currentSort,
  direction = "none",
  onSort,
  title,
  className = "",
}: ColumnHeaderProps) {
  const isActive = sortKey && currentSort === sortKey;
  const ariaSort: React.AriaAttributes["aria-sort"] =
    isActive ? (direction === "asc" ? "ascending" : "descending") : "none";

  if (!sortKey || !onSort) {
    return (
      <th
        scope="col"
        className={`px-3 py-2 text-left text-xs font-medium ${className}`}
        style={{ color: "var(--color-text-muted)" }}
        title={title}
      >
        {label}
      </th>
    );
  }

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`px-3 py-2 text-left text-xs font-medium ${className}`}
    >
      <button
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1 transition-colors hover:text-white"
        style={{ color: isActive ? "var(--color-text)" : "var(--color-text-muted)" }}
        title={title}
      >
        {label}
        <span aria-hidden="true" style={{ fontSize: "0.65rem" }}>
          {isActive ? (direction === "asc" ? "▲" : "▼") : "⇅"}
        </span>
      </button>
    </th>
  );
}
