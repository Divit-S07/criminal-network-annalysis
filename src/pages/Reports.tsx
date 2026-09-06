import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { FileText, Download, Loader2, Printer, Upload, Shield } from "lucide-react";
import { useData } from "@/context/DataContext";
import type { Entity, Relationship, EvidenceItem, TimelineEvent } from "@/types";

export default function ReportsPage() {
  const { cases, entities, relationships, evidence, timeline } = useData();
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState("");
  const [report, setReport] = useState("");
  const [generating, setGenerating] = useState(false);

  const caseSummary = useMemo(() => {
    if (!selectedCase) return null;
    const caseData = cases.find((c) => c.id === selectedCase);
    const caseEntities = entities.filter((e) => e.cases.includes(selectedCase)) as Entity[];
    const caseRels = relationships.filter((r) => {
      const s = entities.find((n) => n.id === r.source);
      const t = entities.find((n) => n.id === r.target);
      return s?.cases.includes(selectedCase) || t?.cases.includes(selectedCase);
    }) as Relationship[];
    const caseEvidence = evidence.filter((e) => e.caseId === selectedCase) as EvidenceItem[];
    const caseTimeline = timeline.filter((e) => e.caseId === selectedCase) as TimelineEvent[];
    return { caseData, caseEntities, caseRels, caseEvidence, caseTimeline };
  }, [selectedCase, cases, entities, relationships, evidence, timeline]);

  async function handleGenerate() {
    if (!selectedCase) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 900));

    const { caseData, caseEntities, caseRels, caseEvidence, caseTimeline } = caseSummary || {};
    if (!caseData || !caseEntities || !caseRels || !caseEvidence || !caseTimeline) {
      setGenerating(false);
      return;
    }

    const content = `CASE INVESTIGATION SUMMARY
${"=".repeat(40)}

Case ID: ${selectedCase}
${`Name: ${caseData.name}
Location: ${caseData.location}
Status: ${caseData.status}`}

KEY ENTITIES (${caseEntities.length})
${caseEntities.map((e) => `  - ${e.label} (${e.type}, ${e.networkImportance} importance)`).join("\n") || "  None"}

IMPORTANT RELATIONSHIPS (${caseRels.length})
${caseRels.slice(0, 10).map((r) => `  - ${r.source} → [${r.type}] → ${r.target} (${r.confidence}% confidence, ${r.status})`).join("\n") || "  None"}

POTENTIAL CONNECTORS
${caseEntities.filter((e) => e.cases.length >= 2).map((e) => `  - ${e.label}: appears in ${e.cases.length} cases`).join("\n") || "  None identified"}

TIMELINE (${caseTimeline.length} events)
${caseTimeline.map((t) => `  ${t.date} ${t.time}: ${t.description} [${t.source}]`).join("\n") || "  None"}

EVIDENCE (${caseEvidence.length} records)
${caseEvidence.map((e) => `  - ${e.id}: ${e.details} (${e.confidence}% confidence)`).join("\n") || "  None"}

ANALYTICAL FINDINGS
  - Total entities involved: ${caseEntities.length}
  - Total relationships: ${caseRels.length}
  - Observed relationships: ${caseRels.filter((r) => r.status === "OBSERVED").length}
  - Inferred relationships: ${caseRels.filter((r) => r.status === "INFERRED").length}
  - Multi-source verified: ${caseRels.filter((r) => r.status === "MULTI-SOURCE").length}
  - Average confidence: ${caseRels.length ? Math.round(caseRels.reduce((a, r) => a + r.confidence, 0) / caseRels.length) : 0}%

NOTE: This report is generated for investigative assistance only.
All findings are potential connections requiring further verification.
Investigators remain responsible for final interpretation.`;

    setReport(content);
    setGenerating(false);
  }

  function handleDownload() {
    if (!report) return;
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCase || "investigation"}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    if (!report) return;
    const printWindow = window.open("", "_blank", "width=1000,height=700");
    if (!printWindow) return;
    printWindow.document.write(`<pre style="font-family:monospace;font-size:12px;white-space:pre-wrap;padding:24px;color:#e5e7eb;background:#0a0b10">${report}</pre>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  if (cases.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
          <FileText className="mx-auto mb-3 size-8 text-white/15" />
          <h2 className="text-sm font-semibold text-white/70">No reports available</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-white/30">Reports are generated from investigation cases. Upload data to create cases first.</p>
          <button
            onClick={() => navigate("/app/upload")}
            className="mt-5 flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-[11px] font-medium text-white hover:bg-cyan-500"
          >
            <Upload className="size-3" /> Upload data
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
            <h1 className="text-lg font-semibold tracking-tight text-white/90">Reports</h1>
            <p className="mt-0.5 text-xs text-white/30">Generate investigation reports</p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 size-3.5 text-cyan-400/40" />
              <div className="flex-1">
                <h2 className="mb-1 text-xs font-medium text-white/50">Case Investigation Summary</h2>
                <p className="text-[10px] text-white/20">Selected case data is summarized into a plain-text investigative report. Reports are decision-support artifacts, not conclusive findings.</p>
              </div>
            </div>

            <div className="mt-4 flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-white/30">Select Case</label>
                <select
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] text-white/60 outline-none"
                >
                  <option value="" className="bg-[#14151c]">Choose a case...</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#14151c]">
                      {c.id} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={!selectedCase || generating}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-[11px] font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
              >
                {generating ? <Loader2 className="size-3 animate-spin" /> : <FileText className="size-3" />}
                {generating ? "Generating..." : "Generate Report"}
              </button>
            </div>

            {selectedCase && caseSummary?.caseData && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10 px-3 py-2 text-[10px] text-cyan-400/60">
                <span>Generating for</span>
                <span className="font-medium text-cyan-300">{caseSummary.caseData.name}</span>
                <span className="text-white/20">·</span>
                <span>{caseSummary.caseEntities.length} entities · {caseSummary.caseRels.length} relationships</span>
              </div>
            )}
          </div>

          {report && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-medium text-white/50">Report Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-[11px] text-white/50 hover:bg-white/[0.04]"
                  >
                    <Download className="size-3" /> Download
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-[11px] text-white/50 hover:bg-white/[0.04]"
                  >
                    <Printer className="size-3" /> Print
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 font-mono text-[11px] leading-relaxed text-white/60">
                {report}
              </pre>
            </div>
          )}

          {!report && !generating && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
              <FileText className="mx-auto mb-2 size-6 text-white/15" />
              <p className="text-xs text-white/30">Select a case and click Generate Report to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
