"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, DollarSign, Users, Building2, Target,
  BarChart3, PieChart, Zap, RefreshCw, AlertTriangle,
  ChevronUp, ChevronDown, Flame, ArrowUpRight,
} from "lucide-react";
import type { Lead } from "@/lib/supabase";
import type { Tenant } from "./TenantsTab";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtMoney(n: number, compact = false): string {
  if (compact && n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (compact && n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function pct(num: number, den: number): number {
  return den === 0 ? 0 : Math.round((num / den) * 100);
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = "#4ADE80", icon: Icon }:
  { label: string; value: string; sub?: string; color?: string; icon: React.ElementType }) {
  return (
    <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-[0.07] pointer-events-none" style={{ backgroundColor: color }} />
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={13} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-black text-white tabular-nums leading-none">{value}</p>
      {sub && <p className="text-[11px] text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

function BarRow({ label, value, max, color, sub }: { label: string; value: number; max: number; color: string; sub?: string }) {
  const width = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-300 truncate max-w-[60%]">{label}</span>
        <div className="text-right">
          <span className="text-xs font-bold tabular-nums" style={{ color }}>{fmtMoney(value, true)}</span>
          {sub && <span className="text-[10px] text-gray-600 ml-1">{sub}</span>}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ─── 12-Month Revenue Forecast ───────────────────────────────────────────────

function RevenueForecast({ tenants }: { tenants: Tenant[] }) {
  const activeTenants = tenants.filter(t => t.status === "active");
  const now = new Date();

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return { label: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), month: d.getMonth(), date: d };
  });

  // For each month, calculate expected MRR
  const monthlyRevenue = months.map(({ date }) => {
    let mrr = 0;
    activeTenants.forEach(t => {
      // Skip if lease has ended before this month
      if (t.leaseEnd) {
        const end = new Date(t.leaseEnd);
        if (end < date) return;
      }
      // Apply escalation if it falls on/before this month
      let rent = t.monthlyRent;
      if (t.escalationDate && t.escalationPct > 0) {
        const escDate = new Date(t.escalationDate);
        if (escDate <= date) {
          rent = rent * (1 + t.escalationPct / 100);
        }
      }
      mrr += rent;
    });
    return Math.round(mrr);
  });

  const maxMRR = Math.max(...monthlyRevenue, 1);
  const baselineMRR = monthlyRevenue[0];
  const finalMRR = monthlyRevenue[monthlyRevenue.length - 1];
  const growth = baselineMRR > 0 ? ((finalMRR - baselineMRR) / baselineMRR) * 100 : 0;

  // Detect months with lease expirations or escalations
  const eventMonths = new Set<number>();
  activeTenants.forEach(t => {
    if (t.leaseEnd) {
      const d = new Date(t.leaseEnd);
      months.forEach((m, i) => {
        if (d.getFullYear() === m.year && d.getMonth() === m.month) eventMonths.add(i);
      });
    }
    if (t.escalationDate) {
      const d = new Date(t.escalationDate);
      months.forEach((m, i) => {
        if (d.getFullYear() === m.year && d.getMonth() === m.month) eventMonths.add(i);
      });
    }
  });

  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-[#4ADE80]" />
          <p className="text-xs font-black text-white uppercase tracking-widest">12-Month Revenue Forecast</p>
        </div>
        {growth !== 0 && (
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg ${growth > 0 ? "text-[#4ADE80] bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.25)]" : "text-red-400 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)]"}`}>
            {growth > 0 ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            {Math.abs(growth).toFixed(1)}% over 12mo
          </span>
        )}
      </div>
      <p className="text-[11px] text-gray-600 mb-4">Projections include scheduled rent escalations and lease expirations</p>

      {activeTenants.length === 0 ? (
        <p className="text-sm text-gray-600 italic text-center py-6">Add tenants to see revenue forecast</p>
      ) : (
        <>
          {/* Bar chart */}
          <div className="flex items-end gap-1 h-24 mb-2">
            {monthlyRevenue.map((mrr, i) => {
              const h = maxMRR === 0 ? 0 : Math.max(4, Math.round((mrr / maxMRR) * 96));
              const hasEvent = eventMonths.has(i);
              const isDropping = i > 0 && mrr < monthlyRevenue[i - 1];
              const color = isDropping ? "#F97316" : "#4ADE80";
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 whitespace-nowrap bg-[#0A0F1A] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1 text-[10px] text-white shadow-xl">
                    {months[i].label} {months[i].year}<br />{fmtMoney(mrr)}
                    {hasEvent && <><br /><span className="text-[#FACC15]">⚡ Event</span></>}
                  </div>
                  <div
                    className="w-full rounded-t-sm transition-all duration-500"
                    style={{ height: `${h}px`, backgroundColor: color, opacity: hasEvent ? 1 : 0.7 }}
                  />
                  {hasEvent && <div className="w-1 h-1 rounded-full bg-[#FACC15] mt-0.5" />}
                </div>
              );
            })}
          </div>
          {/* X-axis labels */}
          <div className="flex gap-1">
            {months.map((m, i) => (
              <div key={i} className="flex-1 text-center">
                <span className="text-[9px] text-gray-700">{m.label}</span>
              </div>
            ))}
          </div>
          {/* Summary */}
          <div className="flex gap-4 mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
            <div>
              <p className="text-[10px] text-gray-600">Today MRR</p>
              <p className="text-sm font-black text-white">{fmtMoney(baselineMRR)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600">12mo MRR</p>
              <p className="text-sm font-black" style={{ color: finalMRR >= baselineMRR ? "#4ADE80" : "#F97316" }}>{fmtMoney(finalMRR)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600">12mo ARR</p>
              <p className="text-sm font-black text-white">{fmtMoney(monthlyRevenue.reduce((a, b) => a + b, 0))}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main AnalyticsTab ────────────────────────────────────────────────────────

export default function AnalyticsTab({ leads }: { leads: Lead[] }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tenants");
      const data = await res.json();
      if (Array.isArray(data.tenants)) setTenants(data.tenants.map((r: Record<string, unknown>) => ({
        id: r.id as string, name: r.name as string,
        contactName: (r.contact_name as string) || "",
        email: (r.email as string) || "",
        phone: (r.phone as string) || "",
        building: (r.building as string) || "",
        unit: (r.unit as string) || "",
        rep: (r.rep as string) || "",
        monthlyRent: Number(r.monthly_rent) || 0,
        leaseStart: (r.lease_start as string) || null,
        leaseEnd: (r.lease_end as string) || null,
        renewalDate: (r.renewal_date as string) || null,
        escalationPct: Number(r.escalation_pct) || 0,
        escalationDate: (r.escalation_date as string) || null,
        status: (r.status as "active" | "pending" | "expired") || "active",
        notes: (r.notes as string) || "",
        sourceLeadId: (r.source_lead_id as string) || "",
        createdAt: (r.created_at as string) || "",
      })));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  // ── Tenant metrics ───────────────────────────────────────────────────────
  const activeTenants = tenants.filter(t => t.status === "active");
  const totalMRR = activeTenants.reduce((s, t) => s + t.monthlyRent, 0);
  const totalARR = totalMRR * 12;
  const renewalRisk = activeTenants.filter(t => {
    const d = t.renewalDate || t.leaseEnd;
    if (!d) return false;
    const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    return days <= 90 && days >= 0;
  });
  const renewalRiskMRR = renewalRisk.reduce((s, t) => s + t.monthlyRent, 0);

  // Building breakdown
  const byBuilding = activeTenants.reduce((acc, t) => {
    const key = t.building || "Unassigned";
    if (!acc[key]) acc[key] = { count: 0, mrr: 0 };
    acc[key].count++;
    acc[key].mrr += t.monthlyRent;
    return acc;
  }, {} as Record<string, { count: number; mrr: number }>);
  const buildingList = Object.entries(byBuilding).sort((a, b) => b[1].mrr - a[1].mrr);
  const maxBuildingMRR = Math.max(...buildingList.map(([, v]) => v.mrr), 1);

  // Rep leaderboard (from tenants)
  const byRep = activeTenants.reduce((acc, t) => {
    const key = t.rep || "Unassigned";
    if (!acc[key]) acc[key] = { count: 0, mrr: 0 };
    acc[key].count++;
    acc[key].mrr += t.monthlyRent;
    return acc;
  }, {} as Record<string, { count: number; mrr: number }>);
  const repList = Object.entries(byRep).sort((a, b) => b[1].mrr - a[1].mrr);

  // ── Lead metrics ────────────────────────────────────────────────────────
  const activeLeads = leads.filter(l => {
    const hrs = (Date.now() - new Date(l.timestamp).getTime()) / 36e5;
    return hrs < 24 * 90; // within 90 days
  });
  const hotLeads = activeLeads.filter(l => l.scoreLabel === "Hot Lead");
  const warmLeads = activeLeads.filter(l => l.scoreLabel === "Warm Lead");
  const nurtureLeads = activeLeads.filter(l => l.scoreLabel === "Nurture");
  const hotPipeline = hotLeads.reduce((s, l) => s + l.budget, 0);
  const totalPipeline = activeLeads.reduce((s, l) => s + l.budget, 0);
  const whaleLeads = activeLeads.filter(l => l.isWhale);
  const avgScore = activeLeads.length ? Math.round(activeLeads.reduce((s, l) => s + l.score, 0) / activeLeads.length) : 0;

  // Lead source breakdown
  const bySrc = activeLeads.reduce((acc, l) => {
    const key = l.source === "qr" ? "QR Scan" : l.source === "facebook" ? "Facebook" : l.source === "instagram" ? "Instagram" : l.source === "google" ? "Google" : "Organic";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const srcList = Object.entries(bySrc).sort((a, b) => b[1] - a[1]);
  const maxSrc = Math.max(...srcList.map(([, v]) => v), 1);

  // Space type breakdown
  const bySpace = activeLeads.reduce((acc, l) => {
    acc[l.spaceType] = (acc[l.spaceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const spaceList = Object.entries(bySpace).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const convRate = tenants.length > 0 && activeLeads.length > 0
    ? pct(tenants.length, activeLeads.length + tenants.length)
    : 0;

  if (loading) {
    return (
      <div className="mt-6 flex items-center justify-center py-24">
        <RefreshCw size={18} className="animate-spin text-[#4ADE80]" />
        <span className="ml-2 text-sm text-gray-500">Loading analytics…</span>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center shadow-[0_0_12px_rgba(74,222,128,0.3)]">
            <BarChart3 size={14} className="text-black" />
          </div>
          <div>
            <p className="text-xs font-black text-[#4ADE80] uppercase tracking-widest">Analytics</p>
            <p className="text-[11px] text-gray-500">{activeTenants.length} tenants · {activeLeads.length} active leads</p>
          </div>
        </div>
        <button onClick={fetchTenants} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(74,222,128,0.06)] border border-[rgba(74,222,128,0.2)] text-[#4ADE80] text-xs hover:bg-[rgba(74,222,128,0.12)] transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* ── KPI row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Portfolio ARR" value={fmtMoney(totalARR, true)} sub={`${fmtMoney(totalMRR, true)}/mo from ${activeTenants.length} tenants`} icon={Building2} color="#4ADE80" />
        <StatCard label="Hot Pipeline" value={fmtMoney(hotPipeline, true)} sub={`${hotLeads.length} hot leads`} icon={Flame} color="#EF4444" />
        <StatCard label="Conversion Rate" value={`${convRate}%`} sub={`${tenants.length} leads → tenants`} icon={Target} color="#60A5FA" />
        <StatCard label="Avg Lead Score" value={`${avgScore}`} sub={`${whaleLeads.length} whale${whaleLeads.length !== 1 ? "s" : ""} detected`} icon={TrendingUp} color="#FACC15" />
      </div>

      {/* ── Revenue Forecast ───────────────────────────────────────── */}
      <RevenueForecast tenants={tenants} />

      {/* ── Two-col grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Lead Pipeline Funnel */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={13} className="text-[#FACC15]" />
            <p className="text-xs font-black text-white uppercase tracking-widest">Lead Pipeline</p>
          </div>
          {activeLeads.length === 0 ? (
            <p className="text-sm text-gray-600 italic">No lead data yet</p>
          ) : (
            <>
              {[
                { label: `🔥 Hot (${hotLeads.length})`, value: hotPipeline, color: "#EF4444" },
                { label: `⚡ Warm (${warmLeads.length})`, value: warmLeads.reduce((s, l) => s + l.budget, 0), color: "#FACC15" },
                { label: `● Nurture (${nurtureLeads.length})`, value: nurtureLeads.reduce((s, l) => s + l.budget, 0), color: "#94A3B8" },
              ].map(row => (
                <BarRow key={row.label} label={row.label} value={row.value} max={totalPipeline} color={row.color} sub="/mo" />
              ))}
              <div className="border-t border-[rgba(255,255,255,0.05)] pt-3 mt-3 flex justify-between">
                <span className="text-[11px] text-gray-500">Total pipeline</span>
                <span className="text-sm font-black text-[#4ADE80]">{fmtMoney(totalPipeline, true)}/mo</span>
              </div>
              {renewalRisk.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[rgba(239,68,68,0.07)] border border-[rgba(239,68,68,0.2)]">
                  <AlertTriangle size={11} className="text-red-400 flex-shrink-0" />
                  <span className="text-[11px] text-red-400"><span className="font-bold">{fmtMoney(renewalRiskMRR, true)}/mo</span> at renewal risk ({renewalRisk.length} tenant{renewalRisk.length !== 1 ? "s" : ""} ≤90d)</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Revenue by Building */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={13} className="text-[#60A5FA]" />
            <p className="text-xs font-black text-white uppercase tracking-widest">Revenue by Property</p>
          </div>
          {buildingList.length === 0 ? (
            <p className="text-sm text-gray-600 italic">No tenant data yet</p>
          ) : buildingList.map(([building, { count, mrr }]) => (
            <BarRow key={building} label={building} value={mrr} max={maxBuildingMRR} color="#60A5FA" sub={`${count} tenant${count !== 1 ? "s" : ""}`} />
          ))}
          {buildingList.length > 0 && (
            <div className="border-t border-[rgba(255,255,255,0.05)] pt-3 mt-3 flex justify-between">
              <span className="text-[11px] text-gray-500">Portfolio total</span>
              <span className="text-sm font-black text-[#60A5FA]">{fmtMoney(totalMRR, true)}/mo</span>
            </div>
          )}
        </div>

        {/* Rep Leaderboard */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={13} className="text-[#C4B5FD]" />
            <p className="text-xs font-black text-white uppercase tracking-widest">Rep Leaderboard</p>
            <span className="text-[10px] text-gray-600 ml-1">(by revenue closed)</span>
          </div>
          {repList.length === 0 ? (
            <p className="text-sm text-gray-600 italic">Assign reps to tenants to see leaderboard</p>
          ) : repList.map(([rep, { count, mrr }], idx) => (
            <div key={rep} className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                style={{ backgroundColor: idx === 0 ? "rgba(250,204,21,0.15)" : "rgba(255,255,255,0.05)", color: idx === 0 ? "#FACC15" : "#6B7280" }}>
                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-200 truncate">{rep}</span>
                  <span className="text-xs font-bold text-[#C4B5FD] ml-2 flex-shrink-0">{fmtMoney(mrr, true)}/mo</span>
                </div>
                <div className="h-1 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct(mrr, repList[0][1].mrr)}%`, backgroundColor: "#C4B5FD", opacity: 0.7 }} />
                </div>
                <p className="text-[10px] text-gray-600 mt-0.5">{count} active lease{count !== 1 ? "s" : ""} · {fmtMoney(mrr * 12, true)}/yr</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lead Source + Space Type */}
        <div className="space-y-4">
          {/* Source breakdown */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpRight size={13} className="text-[#F472B6]" />
              <p className="text-xs font-black text-white uppercase tracking-widest">Lead Sources</p>
            </div>
            {srcList.length === 0 ? (
              <p className="text-sm text-gray-600 italic">No lead data yet</p>
            ) : srcList.map(([src, count]) => (
              <div key={src} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400 w-20 flex-shrink-0">{src}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                  <div className="h-full rounded-full bg-[#F472B6]" style={{ width: `${pct(count, maxSrc)}%`, opacity: 0.75 }} />
                </div>
                <span className="text-xs font-bold text-[#F472B6] w-6 text-right">{count}</span>
              </div>
            ))}
          </div>

          {/* Space type demand */}
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <PieChart size={13} className="text-[#F97316]" />
              <p className="text-xs font-black text-white uppercase tracking-widest">Space Demand</p>
            </div>
            {spaceList.length === 0 ? (
              <p className="text-sm text-gray-600 italic">No lead data yet</p>
            ) : spaceList.map(([space, count]) => (
              <div key={space} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400 truncate flex-1">{space}</span>
                <span className="text-xs font-bold text-[#F97316]">{count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Ask VISION nudge ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-[rgba(74,222,128,0.15)] bg-[rgba(74,222,128,0.04)] p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center flex-shrink-0">
          <TrendingUp size={14} className="text-black" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-[#4ADE80]">Ask VISION for deeper insights</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Try: "Which rep has the highest revenue per lease?" · "What's my average deal size by property?" · "Who's up for renewal this quarter?"</p>
        </div>
      </div>

    </div>
  );
}
