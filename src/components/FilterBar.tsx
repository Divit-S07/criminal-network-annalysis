import { Filter, X } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  resultCount?: number;
}

export function FilterBar({ filters, onChange, onClear, resultCount }: FilterBarProps) {
  const hasActive = filters.some((f) => f.value !== "");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-white/30">
        <Filter className="size-3" />
      </div>
      {filters.map((f) => (
        <div key={f.key} className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1">
          <select
            value={f.value}
            onChange={(e) => onChange(f.key, e.target.value)}
            className="bg-transparent text-[11px] text-white/60 outline-none"
          >
            <option value="" className="bg-[#14151c]">{f.label}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#14151c]">{o.label}</option>
            ))}
          </select>
        </div>
      ))}
      {hasActive && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/40 hover:text-white/60"
        >
          <X className="size-3" />
          Clear
        </button>
      )}
      {resultCount !== undefined && (
        <span className="text-[10px] text-white/20 ml-1">{resultCount} results</span>
      )}
    </div>
  );
}
