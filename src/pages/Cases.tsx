import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Eye, X, Clock, MapPin, Users, GitBranch, Briefcase } from "lucide-react";
import { useData } from "@/context/DataContext";
import type { Case, Entity } from "@/types";

const statusOptions: { label: string; value: string }[] = [
  { label: "Active", value: "Active" },
  { label: "Under Review", value: "Under Review" },
  { label: "Closed", value: "Closed" },
];

export default function CasesPage() {
  const { cases, entities } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof Case>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const perPage = 6;

  const filtered = useMemo(() => {
    let result = cases;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    if (statusFilter) result = result.filter((c) => c.status === statusFilter);
    result.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return 0;
    });
    return result;
  }, [cases, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  function toggleSort(key: keyof Case) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  if (cases.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
          <Briefcase className="mx-auto mb-3 size-8 text-white/15" />
          <h2 className="text-sm font-semibold text-white/70">No cases yet</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-white/30">Cases are created automatically when you upload investigation records.</p>
          <button
            onClick={() => navigate("/app/upload")}
            className="mt-5 flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-[11px] font-medium text-white hover:bg-cyan-500"
          >
            <Briefcase className="size-3" /> Upload data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col p-6">
        <div className="mx-auto max-w-6xl space-y-5">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white/90">Cases</h1>
            <p className="mt-0.5 text-xs text-white/30">Cases generated from uploaded records</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
              <Search className="size-3 text-white/30" />
              <input
                type="text"
                placeholder="Search cases..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-48 bg-transparent text-[11px] text-white/70 placeholder:text-white/20 outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/60 outline-none"
            >
              <option value="" className="bg-[#14151c]">All statuses</option>
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#14151c]">{o.label}</option>
              ))}
            </select>
            <span className="text-[10px] text-white/20">{filtered.length} cases</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {[
                    { key: "id" as const, label: "Case ID" },
                    { key: "name" as const, label: "Name" },
                    { key: "date" as const, label: "Date" },
                    { key: "location" as const, label: "Location" },
                    { key: "persons" as const, label: "Persons" },
                    { key: "relationships" as const, label: "Relationships" },
                    { key: "status" as const, label: "Status" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      className="cursor-pointer px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-white/30 hover:text-white/50"
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        <ArrowUpDown className="size-2.5" />
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-white/30">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-xs text-white/30">No cases match the current filters</td>
                  </tr>
                ) : paginated.map((c) => (
                  <tr key={c.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-[11px] font-medium text-cyan-400/70">{c.id}</td>
                    <td className="px-4 py-3 text-[11px] text-white/60">{c.name}</td>
                    <td className="px-4 py-3 text-[11px] text-white/40">{new Date(c.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-4 py-3 text-[11px] text-white/40">{c.location}</td>
                    <td className="px-4 py-3 text-[11px] text-white/40">{c.persons}</td>
                    <td className="px-4 py-3 text-[11px] text-white/40">{c.relationships}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${c.status === "Active" ? "bg-cyan-500/10 text-cyan-400" : c.status === "Under Review" ? "bg-amber-500/10 text-amber-400" : "bg-white/[0.05] text-white/40"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedCase(c)} className="text-cyan-400/60 hover:text-cyan-400 flex items-center justify-center">
                        <Eye className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/20">Page {page} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex size-7 items-center justify-center rounded-lg border border-white/[0.08] text-white/40 disabled:opacity-30 hover:bg-white/[0.04]"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex size-7 items-center justify-center rounded-lg text-[11px] ${p === page ? "bg-cyan-600 text-white" : "border border-white/[0.08] text-white/40 hover:bg-white/[0.04]"}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex size-7 items-center justify-center rounded-lg border border-white/[0.08] text-white/40 disabled:opacity-30 hover:bg-white/[0.04]"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}

          {selectedCase && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedCase(null)}>
              <div className="w-full max-w-lg rounded-xl border border-white/[0.08] bg-[#14151c] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white/90">{selectedCase.name}</h2>
                    <p className="text-[11px] text-cyan-400/60">{selectedCase.id}</p>
                  </div>
                  <button onClick={() => setSelectedCase(null)} className="text-white/30 hover:text-white/60">
                    <X className="size-4" />
                  </button>
                </div>
                <p className="mt-3 text-xs text-white/50 leading-relaxed">{selectedCase.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { icon: Clock, label: "Date", value: selectedCase.date },
                    { icon: MapPin, label: "Location", value: selectedCase.location },
                    { icon: Users, label: "Persons", value: String(selectedCase.persons) },
                    { icon: GitBranch, label: "Relationships", value: String(selectedCase.relationships) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
                      <Icon className="size-3 text-white/25" />
                      <div>
                        <div className="text-[10px] text-white/30">{label}</div>
                        <div className="text-[11px] text-white/60">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-white/[0.06] pt-4">
                  <h4 className="text-[10px] font-medium uppercase tracking-wider text-white/30 mb-2">Key Entities in this Case</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {entities
                      .filter((e) => e.cases.includes(selectedCase.id))
                      .slice(0, 14)
                      .map((e) => (
                        <span
                          key={e.id}
                          className={
                            e.type === "PERSON"
                              ? "bg-cyan-500/8 text-cyan-300"
                              : e.type === "PHONE"
                              ? "bg-violet-500/8 text-violet-300"
                              : e.type === "VEHICLE"
                              ? "bg-green-500/8 text-green-300"
                              : e.type === "ACCOUNT"
                              ? "bg-amber-500/8 text-amber-300"
                              : e.type === "LOCATION"
                              ? "bg-red-500/8 text-red-300"
                              : "bg-white/5 text-white/40"
                          }
                        >
                          {e.type} · {e.label}
                        </span>
                      ))}
                    {entities.filter((e) => e.cases.includes(selectedCase.id)).length === 0 && (
                      <span className="text-[10px] text-white/25">No entities mapped yet</span>
                    )}
                  </div>
                  <div className="mt-3 text-[10px] text-white/20">
                    {entities.filter((e) => e.cases.includes(selectedCase.id)).length} entities ·{" "}
                    {entities.filter((e) => e.cases.includes(selectedCase.id)).filter((e) => e.networkImportance === "High").length} high-importance
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-medium ${selectedCase.status === "Active" ? "bg-cyan-500/10 text-cyan-400" : selectedCase.status === "Under Review" ? "bg-amber-500/10 text-amber-400" : "bg-white/[0.05] text-white/40"}`}>
                    {selectedCase.status}
                  </span>
                  <button
                    onClick={() => { navigate(`/app/network?entity=${selectedCase.id}`); setSelectedCase(null); }}
                    className="text-[11px] text-cyan-400/60 hover:text-cyan-400"
                  >
                    View in network →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
