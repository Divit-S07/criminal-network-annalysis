import { useMemo } from "react";
import { useNavigate } from "react-router";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Briefcase, Users, Phone, Car, CreditCard, GitBranch, AlertTriangle, Clock, Upload, Database } from "lucide-react";
import { useData } from "@/context/DataContext";

const COLORS = ["#22d3ee", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#818cf8", "#fb923c", "#e879f9"];
const CHART_HEIGHT = 200;

function StatCard({ icon: Icon, label, value, color = "text-cyan-400" }: { icon: typeof Users; label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center gap-3">
        <div className={`flex size-8 items-center justify-center rounded-lg bg-white/[0.04] ${color}`}>
          <Icon className="size-4" />
        </div>
        <div>
          <div className="text-xl font-semibold tracking-tight text-white/90">{value.toLocaleString()}</div>
          <div className="text-[11px] text-white/30">{label}</div>
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#14151c] px-3 py-2 text-[11px]">
      <div className="text-white/50">{label}</div>
      <div className="text-white/80">{payload[0].value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { cases, entities, relationships, alerts, timeline, stats } = useData();
  const navigate = useNavigate();

  const relationshipsByType = useMemo(() => {
    const map = new Map<string, number>();
    relationships.forEach((r) => map.set(r.type, (map.get(r.type) || 0) + 1));
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [relationships]);

  const entityDistribution = useMemo(() => {
    const map = new Map<string, number>();
    entities.forEach((e) => map.set(e.type, (map.get(e.type) || 0) + 1));
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [entities]);

  const casesByMonth = useMemo(() => {
    const map = new Map<string, number>();
    cases.forEach((c) => {
      const key = new Date(c.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [cases]);

  const activityOverTime = useMemo(() => {
    const map = new Map<string, number>();
    timeline.forEach((t) => {
      const key = new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [timeline]);

  const newAlerts = alerts.filter((a) => a.status === "NEW").slice(0, 3);

  if (!stats || (cases.length === 0 && entities.length === 0)) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
          <Database className="mx-auto mb-3 size-8 text-white/15" />
          <h2 className="text-sm font-semibold text-white/70">No investigation data yet</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-white/30">
            Upload investigation records to build the case graph. Entities, relationships, timeline and alerts are generated from your files.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              onClick={() => navigate("/app/upload")}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-[11px] font-medium text-white hover:bg-cyan-500"
            >
              <Upload className="size-3" /> Upload data
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: Briefcase, label: "Cases", value: stats.totalCases },
    { icon: Users, label: "Persons", value: stats.persons },
    { icon: Phone, label: "Phones", value: stats.phones },
    { icon: Car, label: "Vehicles", value: stats.vehicles },
    { icon: CreditCard, label: "Accounts", value: stats.accounts },
    { icon: GitBranch, label: "Relationships", value: stats.relationships },
    { icon: AlertTriangle, label: "Alerts", value: stats.alerts, color: "text-amber-400" },
  ];

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white/90">Dashboard</h1>
          <p className="mt-0.5 text-xs text-white/30">Investigation overview · {entities.length} entities in network</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {statCards.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h2 className="mb-3 text-xs font-medium text-white/50">Relationships by Type</h2>
            {relationshipsByType.length === 0 ? <p className="text-xs text-white/25">No relationships yet</p> : (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart data={relationshipsByType}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {relationshipsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.7} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h2 className="mb-3 text-xs font-medium text-white/50">Entity Distribution</h2>
            {entityDistribution.length === 0 ? <p className="text-xs text-white/25">No entities yet</p> : (
              <>
                <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                  <PieChart>
                    <Pie data={entityDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={3}>
                      {entityDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.7} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-1 flex flex-wrap justify-center gap-3">
                  {entityDistribution.map((e, i) => (
                    <div key={e.name} className="flex items-center gap-1.5 text-[10px] text-white/30">
                      <span className="size-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {e.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h2 className="mb-3 text-xs font-medium text-white/50">Cases by Month</h2>
            {casesByMonth.length === 0 ? <p className="text-xs text-white/25">No cases yet</p> : (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <LineChart data={casesByMonth}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={{ fill: "#22d3ee", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h2 className="mb-3 text-xs font-medium text-white/50">Activity Over Time</h2>
            {activityOverTime.length === 0 ? <p className="text-xs text-white/25">No activity yet</p> : (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <AreaChart data={activityOverTime}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 lg:col-span-2">
            <h2 className="mb-3 text-xs font-medium text-white/50">Recent Alerts</h2>
            {newAlerts.length === 0 ? <p className="text-xs text-white/25">No new alerts</p> : (
              <div className="space-y-2">
                {newAlerts.map((a) => (
                  <div key={a.id} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-amber-400/70">{a.type}</span>
                        <p className="mt-1 text-xs text-white/60">{a.reason}</p>
                        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-white/25">
                          <span>{a.confidence}% confidence</span>
                          <span>{a.evidenceCount} records</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/app/alerts")}
                        className="shrink-0 text-[10px] text-cyan-400/50 hover:text-cyan-400"
                      >
                        Investigate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 lg:col-span-1">
            <h2 className="mb-3 text-xs font-medium text-white/50">Recent Activity</h2>
            <div className="space-y-0">
              {timeline.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b border-white/[0.04] py-2 last:border-0">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3 text-white/20" />
                    <span className="text-[11px] text-white/50">{t.description}</span>
                  </div>
                  <span className="text-[10px] text-white/20">{t.date.slice(5)}</span>
                </div>
              ))}
              {timeline.length === 0 && <p className="text-xs text-white/25">No activity yet — upload data to begin</p>}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3">
          <p className="text-[10px] leading-relaxed text-white/20">
            This system provides investigative assistance. Graph connections are not proof of criminal activity.
            All relationships are backed by evidence and presented as investigative leads.
            Investigators remain responsible for final interpretation.
          </p>
        </div>
      </div>
    </div>
  );
}
