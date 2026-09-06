import { useState, useEffect, useMemo } from "react";
import { Clock, Phone, Car, MapPin, CreditCard, Users, FileText, Filter } from "lucide-react";
import { useNavigate } from "react-router";
import { useData } from "@/context/DataContext";

const sourceIcons: Record<string, typeof Users> = {
  CDR: Phone,
  "Vehicle Record": Car,
  "Location Record": MapPin,
  "Transaction Record": CreditCard,
  "Bank Record": CreditCard,
  "Case Record": FileText,
};
const sourceColors: Record<string, string> = {
  CDR: "bg-violet-500/10 text-violet-400",
  "Vehicle Record": "bg-emerald-500/10 text-emerald-400",
  "Location Record": "bg-red-500/10 text-red-400",
  "Transaction Record": "bg-amber-500/10 text-amber-400",
  "Bank Record": "bg-amber-500/10 text-amber-400",
  "Case Record": "bg-indigo-500/10 text-indigo-400",
};

export default function TimelinePage() {
  const { timeline, cases, hasData } = useData();
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState("");
  const [caseFilter, setCaseFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  useEffect(() => { setDateFilter(""); setCaseFilter(""); setSourceFilter(""); }, [timeline.length]);

  const filtered = useMemo(() => {
    let result = timeline;
    if (dateFilter) result = result.filter((e) => e.date === dateFilter);
    if (caseFilter) result = result.filter((e) => e.caseId === caseFilter);
    if (sourceFilter) result = result.filter((e) => e.source.includes(sourceFilter));
    return result;
  }, [timeline, dateFilter, caseFilter, sourceFilter]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, typeof filtered>>((acc, e) => {
      if (!acc[e.date]) acc[e.date] = [];
      acc[e.date].push(e);
      return acc;
    }, {});
  }, [filtered]);

  const dates = Object.keys(grouped).sort();
  const uniqueCases = [...new Set(timeline.map((e) => e.caseId))].sort();
  const uniqueSources = [...new Set(timeline.map((e) => e.source))].sort();
  const uniqueDates = [...new Set(timeline.map((e) => e.date))].sort();

  if (!hasData && timeline.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
          <Clock className="mx-auto mb-3 size-8 text-white/15" />
          <h2 className="text-sm font-semibold text-white/70">No timeline events yet</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-white/30">Timeline events are generated when uploaded records are processed.</p>
          <button
            onClick={() => navigate("/app/upload")}
            className="mt-5 flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-[11px] font-medium text-white hover:bg-cyan-500"
          >
            <Clock className="size-3" /> Upload data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white/90">Timeline</h1>
            <p className="mt-0.5 text-xs text-white/30">Chronological investigation events</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
              <Filter className="size-3 text-white/30" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-[11px] text-white/60 outline-none"
              >
                <option value="" className="bg-[#14151c]">All dates</option>
                {uniqueDates.map((d) => (
                  <option key={d} value={d} className="bg-[#14151c]">{d}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
              <select
                value={caseFilter}
                onChange={(e) => setCaseFilter(e.target.value)}
                className="bg-transparent text-[11px] text-white/60 outline-none"
              >
                <option value="" className="bg-[#14151c]">All cases</option>
                {uniqueCases.map((c) => (
                  <option key={c} value={c} className="bg-[#14151c]">{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-transparent text-[11px] text-white/60 outline-none"
              >
                <option value="" className="bg-[#14151c]">All sources</option>
                {uniqueSources.map((s) => (
                  <option key={s} value={s} className="bg-[#14151c]">{s}</option>
                ))}
              </select>
            </div>
            <span className="text-[10px] text-white/20">{filtered.length} events</span>
          </div>

          {dates.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
              <Clock className="mx-auto mb-2 size-6 text-white/15" />
              <p className="text-xs text-white/30">No events match the current filters</p>
            </div>
          ) : (
            <div className="space-y-6">
              {dates.map((date) => (
                <div key={date}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/[0.06]" />
                    <span className="text-xs font-medium text-white/40">
                      {new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <div className="h-px flex-1 bg-white/[0.06]" />
                  </div>
                  <div className="relative ml-4 border-l border-white/[0.06] pl-6">
                    {grouped[date].map((event) => {
                      const Icon = sourceIcons[event.source] || Clock;
                      const colorClass = sourceColors[event.source] || "bg-white/5 text-white/40";
                      return (
                        <div key={event.id} className="relative mb-4 last:mb-0">
                          <div className="absolute -left-[31px] top-1 flex size-3.5 items-center justify-center rounded-full border-2 border-[#0a0b10] bg-[#14151c]">
                            <div className="size-1.5 rounded-full bg-cyan-400/60" />
                          </div>
                          <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-cyan-400/60">{event.time}</span>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${colorClass}`}>
                                <Icon className="size-2.5" />
                                {event.source}
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs text-white/60">{event.description}</p>
                            <div className="mt-1.5 flex items-center gap-3 text-[10px] text-white/25">
                              <span>{event.entity}</span>
                              <span>{event.caseId}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
