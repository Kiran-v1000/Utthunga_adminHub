import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Tooltip as RTooltip,
} from 'recharts';
import { TrendingUp, Clock, CheckCircle2, Building2, Download } from 'lucide-react';

export default function LeadershipDashboard() {
  const { data: travelData } = useQuery({
    queryKey: ['travel-report'],
    queryFn: () => api.get('/reports/travel'),
    select: (res) => (res.data?.data ?? []) as { bu?: { name: string }; travelType: string; status: string }[],
  });

  const { data: grievanceReport } = useQuery({
    queryKey: ['grievance-sla-report'],
    queryFn: () => api.get('/reports/grievance-sla'),
    select: (res) => res.data?.data as { tickets: { priority: string; slaBreached: boolean; status: string; createdAt: string }[]; summary: { total: number; breached: number; resolved: number; open: number } } | undefined,
  });

  const { data: roomData } = useQuery({
    queryKey: ['room-report'],
    queryFn: () => api.get('/reports/room-utilization'),
    select: (res) => (res.data?.data ?? []) as { startTime: string; endTime: string; room: { type: string; officeLocation: string } }[],
  });

  // Build BU spend chart (stacked bar)
  const buSpendMap: Record<string, { domestic: number; international: number }> = {};
  for (const t of travelData ?? []) {
    const bu = t.bu?.name ?? 'Other';
    if (!buSpendMap[bu]) buSpendMap[bu] = { domestic: 0, international: 0 };
    if (t.travelType === 'DOMESTIC') buSpendMap[bu].domestic++;
    else buSpendMap[bu].international++;
  }
  const buBarData = Object.entries(buSpendMap).map(([bu, v]) => ({ bu, ...v }));

  // Grievance resolution trend (by week)
  const gs = grievanceReport?.summary;
  const slaCompliance = gs ? Math.round(((gs.total - gs.breached) / Math.max(gs.total, 1)) * 100) : 0;

  // Room heatmap by type
  const roomHeatmap: Record<string, number> = {};
  for (const b of roomData ?? []) {
    const key = `${b.room.type} (${b.room.officeLocation})`;
    roomHeatmap[key] = (roomHeatmap[key] ?? 0) + 1;
  }
  const roomBarData = Object.entries(roomHeatmap).map(([type, count]) => ({ type, count }));

  const KPIs = [
    { label: 'SLA Compliance',  value: `${slaCompliance}%`, sub: `${gs?.breached ?? 0} breaches`,   icon: CheckCircle2, iconGrad: slaCompliance >= 90 ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,#DC2626,#EF4444)', cardClass: slaCompliance >= 90 ? 'metric-card-green' : 'metric-card-rose' },
    { label: 'Resolved Tickets', value: gs?.resolved ?? 0,  sub: `of ${gs?.total ?? 0} total`,      icon: TrendingUp,   iconGrad: 'linear-gradient(135deg,#7C3AED,#0EA5E9)', cardClass: 'metric-card-violet' },
    { label: 'Open Tickets',     value: gs?.open ?? 0,       sub: 'Needs attention',                 icon: Clock,        iconGrad: 'linear-gradient(135deg,#D97706,#F59E0B)', cardClass: 'metric-card-amber' },
    { label: 'Travel Requests',  value: (travelData ?? []).length, sub: 'All time',                  icon: Building2,    iconGrad: 'linear-gradient(135deg,#0EA5E9,#38BDF8)', cardClass: 'metric-card-blue' },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="text-heading text-text-1">Leadership Dashboard</h1>
          <p className="text-body text-text-2 mt-0.5">Organisation-wide analytics and KPIs</p>
        </div>
        <Button variant="secondary">
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-6 stagger-children">
        {KPIs.map((k) => (
          <div key={k.label} className={`${k.cardClass} relative overflow-hidden`}>
            <div className="flex items-center mb-4">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-glow-sm"
                style={{ background: k.iconGrad }}
              >
                <k.icon className="h-5 w-5" />
              </span>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20 blur-2xl" style={{ background: k.iconGrad }} />
            </div>
            <p className="text-[30px] font-extrabold text-text-1 leading-none tracking-tight">{k.value}</p>
            <p className="text-body font-medium text-text-1 mt-1.5">{k.label}</p>
            <p className="text-caption text-text-2 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* BU Travel stacked bar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Travel by Business Unit</CardTitle>
              <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={buBarData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4F0" vertical={false} />
                <XAxis dataKey="bu" tick={{ fontSize: 11, fill: '#6B6B8A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B6B8A' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E4E4F0', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="domestic" name="Domestic" stackId="a" fill="#5B21B6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="international" name="International" stackId="a" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Room utilisation heatmap (bar) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Room Utilisation</CardTitle>
              <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={roomBarData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6B6B8A' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="type" width={140} tick={{ fontSize: 11, fill: '#6B6B8A' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E4E4F0', fontSize: 12 }} />
                <Bar dataKey="count" name="Bookings" fill="#7C3AED" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Grievance resolution trend — full width */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Grievance Resolution Trend</CardTitle>
            <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Total', value: gs?.total ?? 0, color: 'text-text-1' },
              { label: 'Resolved', value: gs?.resolved ?? 0, color: 'text-success' },
              { label: 'Open', value: gs?.open ?? 0, color: 'text-warning' },
              { label: 'SLA Breaches', value: gs?.breached ?? 0, color: 'text-danger' },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-surface">
                <p className={`text-[22px] font-bold ${s.color}`}>{s.value}</p>
                <p className="text-caption text-text-2 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            <p className="text-body text-text-1">
              SLA Compliance Rate: <span className={`font-bold ${slaCompliance >= 90 ? 'text-success' : 'text-danger'}`}>{slaCompliance}%</span>
              {slaCompliance < 90 && <span className="text-text-2"> — below 90% target</span>}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
