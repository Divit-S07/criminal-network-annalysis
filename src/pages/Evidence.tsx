import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { FileSearch, X, Shield, Clock, ChevronRight, Eye, ChevronLeft } from "lucide-react";
import { useData } from "@/context/DataContext";
import { FilterBar } from "@/components/FilterBar";
import type { EvidenceStatus, Case } from "@/types";

const statusColors: Record<EvidenceStatus, string> = {
  OBSERVED: "bg-cyan-500/10 text-cyan-400",
  INFERRED: "bg-amber-500/10 text-amber-400",
  "MULTI-SOURCE": "bg-green-500/10 text-green-400",
};

const statusLabels: Record<EvidenceStatus, string> = {
  OBSERVED: "Observed",
  INFERRED: "Inferred",
  "MULTI-SOURCE": "Multi-Source",
};

function EvidenceRow({ item, onSelect }: { item: NonNullable<ReturnType<typeof useData>["evidence"]>[number]; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
    >
      <div className="flex size-8 items-center justify-center rounded-md bg-white/[0.04]">
        <FileSearch className="size-3.5 text-white/30" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/70">
            <span className="text-cyan-400/70">{item.id}</span>
            <ChevronRight className="size-3 text-white/20" />
            <span className="text-white/40">{item.relationshipType}</span>
          </span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[item.status]}`}>
            {statusLabels[item.status]}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-white/30">
          <span className="truncate max-w-[200px] text-white/40">{item.details}</span>
          <span>·</span>
          <span>{item.source}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[11px] text-white/40">{item.confidence}%</div>
        <div className="text-[10px] text-white/20">{item.caseId}</div>
      </div>
    </button>
  );
}

export default function EvidencePage() {
  const { evidence, cases, hasData } = useData();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<NonNullable<ReturnType<typeof useData>["evidence"]>[number] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [caseFilter, setCaseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const caseOptions = useMemo<{ label: string; value: string }[]>(() => cases.map((c) => ({ label: `${c.id} — ${c.name}`, value: c.id })), [cases]);
  const statusOptions = useMemo<{ label: string; value: string }[]>(() => Object.entries(statusLabels).map(([v, l]) => ({ label: l, value: v })), []);
  const sourceOptions = useMemo<{ label: string; value: string }[]>(() => [...new Set(evidence.map((e) => e.source))].map((s) => ({ label: s, value: s })), [evidence]);

  const filtered = useMemo(() => {
    let result = evidence;
    if (caseFilter) result = result.filter((e) => e.caseId === caseFilter);
    if (statusFilter) result = result.filter((e) => e.status === statusFilter);
    if (sourceFilter) result = result.filter((e) => e.source === sourceFilter);
    return result;
  }, [evidence, caseFilter, statusFilter, sourceFilter]);

  const filters = useMemo(
    () => [
      { key: "case", label: "All cases", options: caseOptions, value: caseFilter },
      { key: "status", label: "All statuses", options: statusOptions, value: statusFilter },
      { key: "source", label: "All sources", options: sourceOptions, value: sourceFilter },
    ],
    [caseFilter, statusFilter, sourceFilter, caseOptions, statusOptions, sourceOptions]
  );

  function clearFilters() {
    setCaseFilter("");
    setStatusFilter("");
    setSourceFilter("");
    setSelected(null);
    setDrawerOpen(false);
  }

  if (!hasData && evidence.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
          <FileSearch className="mx-auto mb-3 size-8 text-white/15" />
          <h2 className="text-sm font-semibold text-white/70">No evidence yet</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-white/30">Evidence records are created when uploaded data is processed into relationships.</p>
          <button
            onClick={() => navigate("/app/upload")}
            className="mt-5 flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-[11px] font-medium text-white hover:bg-cyan-500"
          >
            <Shield className="size-3" /> Upload data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col p-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white/90">Evidence</h1>
            <p className="mt-0.5 text-xs text-white/30">Evidence records supporting relationships</p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <FilterBar
              filters={filters}
              onChange={(key, value) => {
                if (key === "case") setCaseFilter(value);
                if (key === "status") setStatusFilter(value);
                if (key === "source") setSourceFilter(value);
              }}
              onClear={clearFilters}
              resultCount={filtered.length}
            />
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
                <FileSearch className="mx-auto mb-2 size-6 text-white/15" />
                <p className="text-xs text-white/30">No evidence records match the current filters</p>
              </div>
            ) : (
              filtered.map((item) => (
                <EvidenceRow key={item.id} item={item} onSelect={() => { setSelected(item); setDrawerOpen(true); }} />
              ))
            )}
          </div>

          <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 size-3.5 text-cyan-400/40" />
              <p className="text-[10px] leading-relaxed text-white/20">
                Every relationship in this system is backed by evidence. Source records, timestamps and confidence levels are preserved so investigators can trace each connection back to its supporting evidence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {drawerOpen && selected && (
        <div className="flex flex-col border-l border-white/[0.06] bg-[#0e0f14] w-80">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">Evidence Detail</span>
            <button
              onClick={() => { setDrawerOpen(false); setSelected(null); }}
              className="text-white/30 hover:text-white/60"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto px-4 py-4">
            <div className="space-y-3">
              <div className="flex justify-between text-[11px]">
                <span className="text-white/30">ID</span>
                <span className="text-white/70 font-medium">{selected.id}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/30">Source</span>
                <span className="text-white/60">{selected.source}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/30">Case</span>
                <span className="text-white/60">{selected.caseId}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/30">Entity</span>
                <span className="text-white/60">{selected.entity}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/30">Relationship</span>
                <span className="text-white/60">{selected.relationshipType}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/30">Confidence</span>
                <span className="text-white/60">{selected.confidence}%</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/30">Timestamp</span>
                <span className="text-white/60">{new Date(selected.timestamp).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/30">Status</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[selected.status]}`}>
                  {statusLabels[selected.status]}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-white/[0.03] p-3">
              <p className="text-[11px] text-white/50 leading-relaxed">{selected.details}</p>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setSelected(null);
                  navigate("/app/network");
                }}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] text-white/50 hover:bg-white/[0.06] hover:text-white/70 w-full justify-center"
              >
                <Eye className="size-3.5" />
                View in network
              </button>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setSelected(null);
                  navigate("/app/timeline");
                }}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] text-white/50 hover:bg-white/[0.06] hover:text-white/70 w-full justify-center"
              >
                <Clock className="size-3.5" />
                View timeline
              </button>
            </div>

            <div className="mt-5 rounded-md border border-white/[0.04] bg-white/[0.01] p-3">
              <p className="text-[10px] leading-relaxed text-white/20">
                Evidence attribution is mandatory. Investigators must review source records before drawing conclusions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
