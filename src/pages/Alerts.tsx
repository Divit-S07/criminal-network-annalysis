import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, Eye, CheckCircle, XCircle, Clock, Upload, Shield } from "lucide-react";
import { useData } from "@/context/DataContext";
import { FilterBar } from "@/components/FilterBar";
import type { AlertStatus } from "@/types";

const statusConfig: Record<AlertStatus, { label: string; color: string; icon: typeof Clock }> = {
  NEW: { label: "New", color: "text-cyan-400 bg-cyan-500/10", icon: Clock },
  UNDER_REVIEW: { label: "Under Review", color: "text-amber-400 bg-amber-500/10", icon: Eye },
  REVIEWED: { label: "Reviewed", color: "text-green-400 bg-green-500/10", icon: CheckCircle },
  DISMISSED: { label: "Dismissed", color: "text-white/40 bg-white/[0.05]", icon: XCircle },
};

const statusOptions: { label: string; value: string }[] = [
  { label: "New", value: "NEW" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Reviewed", value: "REVIEWED" },
  { label: "Dismissed", value: "DISMISSED" },
];

function AlertCard({ alert, onInvestigate, onStatusChange }: { alert: NonNullable<ReturnType<typeof useData>["alerts"]>[number]; onInvestigate: (entity: string) => void; onStatusChange: (id: string, status: AlertStatus) => void }) {
  const cfg = statusConfig[alert.status];
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-amber-400/70">{alert.type}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.color}`}>
              <cfg.icon className="size-2.5" />
              {cfg.label}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-white/60">{alert.reason}</p>
          <div className="mt-2 space-y-0.5">
            {alert.details.slice(0, 3).map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-white/30">
                <span className="size-0.5 rounded-full bg-white/20" />
                {d}
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex items-center gap-4 text-[10px] text-white/25">
            <span>Confidence: {alert.confidence}%</span>
            <span>{alert.evidenceCount} evidence records</span>
            <span>{new Date(alert.createdTime).toLocaleDateString("en-IN")}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => onInvestigate(alert.entity)}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-[11px] text-cyan-400/60 hover:bg-cyan-500/10 hover:text-cyan-400 w-fit"
          >
            <Eye className="size-3.5" />
            Investigate
          </button>
          <div className="flex gap-1">
            {alert.status === "NEW" && (
              <button
                onClick={() => onStatusChange(alert.id, "UNDER_REVIEW")}
                className="rounded-md border border-white/[0.08] px-3 py-1 text-[11px] text-white/40 hover:bg-white/[0.04] w-fit"
              >
                Mark Review
              </button>
            )}
            {alert.status === "UNDER_REVIEW" && (
              <button
                onClick={() => onStatusChange(alert.id, "REVIEWED")}
                className="rounded-md border border-white/[0.08] px-3 py-1 text-[11px] text-green-400/50 hover:bg-green-500/10 w-fit"
              >
                Mark Done
              </button>
            )}
            {alert.status !== "DISMISSED" && (
              <button
                onClick={() => onStatusChange(alert.id, "DISMISSED")}
                className="rounded-md border border-white/[0.08] px-3 py-1 text-[11px] text-white/40 hover:bg-white/[0.04] w-fit"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { alerts, updateAlertStatus } = useData();
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  const filtered = filter ? alerts.filter((a) => a.status === filter) : alerts;

  if (alerts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
          <AlertTriangle className="mx-auto mb-3 size-8 text-white/15" />
          <h2 className="text-sm font-semibold text-white/70">No alerts yet</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-white/30">
            Alerts are generated automatically when uploaded records show notable connection patterns.
          </p>
          <button
            onClick={() => navigate("/app/upload")}
            className="mt-5 flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-[11px] font-medium text-white hover:bg-cyan-500"
          >
            <Upload className="size-3" />
            Upload data
          </button>
        </div>
      </div>
    );
  }

  const filters = [{ key: "status", label: "All statuses", options: statusOptions, value: filter }];

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col p-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white/90">Alerts</h1>
            <p className="mt-0.5 text-xs text-white/30">Investigative leads requiring review</p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <FilterBar
              filters={filters}
              onChange={(_key, value) => setFilter(value)}
              onClear={() => setFilter("")}
              resultCount={filtered.length}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
              <AlertTriangle className="mx-auto mb-2 size-6 text-white/15" />
              <p className="text-xs text-white/30">No alerts match the current filter</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onInvestigate={(entity) => navigate(`/app/network?entity=${entity}`)}
                  onStatusChange={updateAlertStatus}
                />
              ))}
            </div>
          )}

          <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 size-3.5 text-cyan-400/40" />
              <p className="text-[10px] leading-relaxed text-white/20">
                Alerts represent investigative leads, not criminality verdicts. All findings require further verification by the investigator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
