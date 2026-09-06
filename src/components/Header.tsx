import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, User, LogOut, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import type { SearchResult } from "@/types";

export function Header() {
  const { user, logout } = useAuth();
  const { searchEntities, resetData } = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      setResults(searchEntities(query));
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0e0f14] px-5">
      <div className="flex items-center gap-3 text-xs text-white/30">
        <span className="hidden sm:inline">Investigation Intelligence Platform</span>
        <span className="text-[10px] uppercase tracking-widest text-white/20">v1.0</span>
      </div>

      {/* Search */}
      <div ref={wrapperRef} className="relative">
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 transition-colors focus-within:border-cyan-500/30">
          <Search className="size-3.5 text-white/30" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search entities..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => query.trim().length >= 2 && setOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-48 bg-transparent text-xs text-white/80 placeholder:text-white/25 outline-none sm:w-64"
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults([]); }} className="text-white/30 hover:text-white/50">
              <X className="size-3" />
            </button>
          )}
        </div>

        {open && results.length > 0 && (
          <div className="absolute right-0 top-full z-50 mt-1 w-80 max-h-72 overflow-auto rounded-lg border border-white/[0.08] bg-[#14151c] shadow-2xl">
            {results.map((r) => (
              <button
                key={r.entity.id}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  navigate(`/app/network?entity=${r.entity.id}`);
                }}
                className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
              >
                <span className="mt-0.5 inline-block size-1.5 shrink-0 rounded-full bg-cyan-400" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white/80">{r.entity.label}</div>
                  <div className="mt-0.5 text-[11px] text-white/35">
                    {r.entity.type} · {r.relationships.length} relationships · {r.relatedCases.length} cases
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <div className="flex size-7 items-center justify-center rounded-full bg-white/[0.06]">
            <User className="size-3.5 text-white/40" />
          </div>
          <span className="hidden sm:inline">{user?.name || "Investigator"}</span>
        </div>
        <button
          onClick={() => { resetData(); logout(); }}
          className="flex size-7 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/60"
          title="Sign out"
        >
          <LogOut className="size-3.5" />
        </button>
      </div>
    </header>
  );
}
