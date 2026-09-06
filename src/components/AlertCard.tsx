import { useNavigate } from "react-router";
import type { Alert, AlertStatus } from "@/types";
import { AlertTriangle, Eye, CheckCircle, XCircle, Clock, Shield } from "lucide-react";

const statusConfig: Record<AlertStatus, { label: string; color: string; icon: typeof Clock }> = {
  NEW: { label: "New", color: "text-cyan-400 bg-cyan-500/10", icon: Clock },
  UNDER_REVIEW: { label: "Under Review", color: "text-amber-400 bg-amber-500/10", icon: Eye },
  REVIEWED: { label: "Reviewed", color: "text-green-400 bg-green-500/10", icon: CheckCircle },
  DISMISSED: { label: "Dismissed", color: "text-white/40 bg-white/[0.05]", icon: XCircle },
};

interface AlertCardProps {
  alert: Alert;
  onInvestigate: (entity: string) => void;
  onStatusChange: (id: string, status: AlertStatus) => void;
}

export function AlertCard({ alert, onInvestigate, onStatusChange }: AlertCardProps) {
  const cfg = statusConfig[alert.status];
  const navigate = useNavigate();

  const badgeStyle = cfg.color;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-amber-400/70">{alert.type}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeStyle}`}>
              <cfg.icon className="size-2.5" />
              {cfg.label}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-white/60 leading-relaxed">{alert.reason}</p>

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

      <div className="mt-3 flex items-center gap-2 text-[10px] text-white/20">
        <Shield className="size-2.5 text-cyan-400/30" />
        <span>Investigative lead — requires further verification.</span>
      </div>
    </div>
  );
}
