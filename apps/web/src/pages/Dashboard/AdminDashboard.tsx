import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Users, Ticket, Plane, Package, AlertTriangle, Radio } from 'lucide-react';

const DONUT_COLORS: Record<string, string> = {
  OPEN: '#DC2626', IN_PROGRESS: '#D97706', RESOLVED: '#059669', CLOSED: '#6B6B8A',
};

interface LiveEvent {
  id: string; guestName: string; company?: string;
  host: { name: string }; checkedInAt: string;
}

export default function AdminDashboard() {
  const socket = useSocket();
  const [liveCheckins, setLiveCheckins] = React.useState<LiveEvent[]>([]);

  useEffect(() => {
    if (!socket) return;
    socket.on('visitor:checkin', (event: LiveEvent) => {
      setLiveCheckins((prev) => [event, ...prev].slice(0, 10));
    });
    return () => { socket.off('visitor:checkin'); };
  }, [socket]);

  // Use `select` to unwrap Axios response → API payload automatically
  const { data: vs } = useQuery({
    queryKey: ['visitor-stats-admin'],
    queryFn: () => api.get('/visitors/stats/today'),
    select: (res) => res.data?.data as { total: number; checkedIn: number; pending: number; approved: number } | undefined,
    refetchInterval: 30000,
  });

  const { data: ts } = useQuery({
    queryKey: ['travel-stats'],
    queryFn: () => api.get('/travel/stats'),
    select: (res) => res.data?.data as { pending: number; approved: number; total: number } | undefined,
  });

  const { data: grievanceTickets } = useQuery({
    queryKey: ['grievance-report'],
    queryFn: () => api.get('/reports/grievance-sla'),
    select: (res) => (res.data?.data?.tickets ?? []) as { status: string }[],
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => api.get('/inventory/alerts/low-stock'),
    select: (res) => (res.data?.data ?? []) as { inventoryItem: { name: string }; currentQuantity: number }[],
  });

  const { data: visaExpiryItems } = useQuery({
    queryKey: ['visa-expiry'],
    queryFn: () => api.get('/reports/visa-expiry'),
    select: (res) => (res.data?.data ?? []) as { id: string; country: string; expiryDate: string; user: { name: string } }[],
  });

  // Build grievance donut data
  const grievanceGroups: Record<string, number> = {};
  for (const t of grievanceTickets ?? []) {
    grievanceGroups[t.status] = (grievanceGroups[t.status] ?? 0) + 1;
  }
  const grievancePieData = Object.entries(grievanceGroups).map(([name, value]) => ({ name, value }));

  // Simulated visitor trend (last 7 days) — replace with real API data when available
  const trendData = React.useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString('en-IN', { weekday: 'short' }), visitors: Math.floor(Math.random() * 20) + 5 };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const METRICS = [
    { label: "Today's Visitors", value: vs?.total ?? 0, sub: `${vs?.checkedIn ?? 0} checked in`, icon: Users,   iconGrad: 'linear-gradient(135deg,#7C3AED,#0EA5E9)', cardClass: 'metric-card-violet' },
    { label: 'Open Tickets',     value: grievanceGroups['OPEN'] ?? 0, sub: `${grievanceGroups['IN_PROGRESS'] ?? 0} in progress`, icon: Ticket, iconGrad: 'linear-gradient(135deg,#DC2626,#EF4444)', cardClass: 'metric-card-rose' },
    { label: 'Pending Travel',   value: ts?.pending ?? 0, sub: `${ts?.total ?? 0} total`,        icon: Plane,   iconGrad: 'linear-gradient(135deg,#D97706,#F59E0B)', cardClass: 'metric-card-amber' },
    { label: 'Low Stock Items',  value: (lowStockItems ?? []).length, sub: 'Need reorder',         icon: Package, iconGrad: 'linear-gradient(135deg,#059669,#10B981)', cardClass: 'metric-card-green' },
  ];

  return (
    <div className="page-enter">
      <div className="mb-6 animate-fade-down">
        <h1 className="text-heading text-text-1">Admin Dashboard</h1>
        <p className="text-body text-text-2 mt-0.5">Real-time operations overview</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        {METRICS.map((m) => (
          <div key={m.label} className={`${m.cardClass} relative overflow-hidden`}>
            {/* Gradient icon bubble */}
            <div className="flex items-center justify-between mb-4">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-glow-sm"
                style={{ background: m.iconGrad }}
              >
                <m.icon className="h-5 w-5" />
              </span>
              {/* Subtle bg glow echo */}
              <div
                className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20 blur-2xl"
                style={{ background: m.iconGrad }}
              />
            </div>
            <p className="text-[30px] font-extrabold text-text-1 leading-none tracking-tight">{m.value}</p>
            <p className="text-body font-medium text-text-1 mt-1.5">{m.label}</p>
            <p className="text-caption text-text-2 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader><CardTitle>Visitor Trend (7 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B6B8A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B6B8A' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E4E4F0', fontSize: 13 }} />
                <Line type="monotone" dataKey="visitors" stroke="#5B21B6" strokeWidth={2} dot={{ r: 4, fill: '#5B21B6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Grievances by Status</CardTitle></CardHeader>
          <CardContent>
            {grievancePieData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-text-2 text-sm">No grievance data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={grievancePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {grievancePieData.map((entry) => (
                      <Cell key={entry.name} fill={DONUT_COLORS[entry.name] ?? '#6B6B8A'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E4E4F0', fontSize: 13 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Live check-in feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-green-500 animate-pulse" /> Live Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {liveCheckins.length === 0 ? (
              <p className="text-caption text-text-2 text-center py-6">Waiting for check-ins…</p>
            ) : (
              <ul className="space-y-3">
                {liveCheckins.map((e) => (
                  <li key={e.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-body font-medium text-text-1">{e.guestName}</p>
                      <p className="text-caption text-text-2">{e.company} · Host: {e.host.name}</p>
                    </div>
                    <p className="text-caption text-text-2/60">{formatDateTime(e.checkedInAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Visa expiry alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Visa Expiry Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {(visaExpiryItems ?? []).length === 0 ? (
              <p className="text-caption text-text-2 text-center py-6">No expiries in 90 days</p>
            ) : (
              <ul className="space-y-3">
                {(visaExpiryItems ?? []).slice(0, 5).map((v) => (
                  <li key={v.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-body font-medium text-text-1">{v.user.name}</p>
                      <p className="text-caption text-text-2">{v.country}</p>
                    </div>
                    <p className="text-caption font-medium text-amber-500">
                      {new Date(v.expiryDate).toLocaleDateString('en-IN')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Low stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4 text-red-500" /> Reorder Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {(lowStockItems ?? []).length === 0 ? (
              <p className="text-caption text-text-2 text-center py-6">All stock levels healthy</p>
            ) : (
              <ul className="space-y-3">
                {(lowStockItems ?? []).slice(0, 5).map((a, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <p className="text-body text-text-1">{a.inventoryItem.name}</p>
                    <Badge variant="danger">{a.currentQuantity} left</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
