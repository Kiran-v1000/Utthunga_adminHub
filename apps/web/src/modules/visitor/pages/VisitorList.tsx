import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Users, Clock, CheckCircle2, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '@/hooks/usePermission';

interface Visitor {
  id: string; guestName: string; company?: string; purpose: string;
  officeLocation: string; visitDate: string; status: string;
  host: { name: string }; checkInAt?: string; checkOutAt?: string;
}
interface Stats { total: number; checkedIn: number; pending: number; approved: number; }

export default function VisitorList() {
  const [search, setSearch] = useState('');
  const nav = useNavigate();
  const qc = useQueryClient();
  const { can } = usePermission();

  const { data: stats } = useQuery({
    queryKey: ['visitor-stats'],
    queryFn: () => api.get('/visitors/stats/today'),
    select: (res) => res.data?.data as Stats | undefined,
  });

  const { data: visitors, isLoading } = useQuery({
    queryKey: ['visitors'],
    queryFn: () => api.get('/visitors?limit=50'),
    select: (res) => (res.data?.data ?? []) as Visitor[],
  });

  const checkIn = useMutation({
    mutationFn: (id: string) => api.patch(`/visitors/${id}/status`, { status: 'CHECKED_IN' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visitors'] }),
  });

  const columns: Column<Visitor>[] = [
    { key: 'guestName', header: 'Guest', render: (r) => (
      <div>
        <p className="font-medium text-text-1">{r.guestName}</p>
        <p className="text-caption text-text-2">{r.company}</p>
      </div>
    )},
    { key: 'host', header: 'Host', render: (r) => r.host.name },
    { key: 'purpose', header: 'Purpose', className: 'max-w-[180px]', render: (r) => (
      <span className="truncate block">{r.purpose}</span>
    )},
    { key: 'officeLocation', header: 'Office', render: (r) => <Badge variant="outline">{r.officeLocation}</Badge> },
    { key: 'visitDate', header: 'Visit Date', render: (r) => formatDate(r.visitDate) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', header: '', render: (r) => (
      <div className="flex gap-2">
        {r.status === 'APPROVED' && can('RECEPTIONIST', 'SUPER_ADMIN', 'FACILITY_MANAGER', 'ADMIN_EXECUTIVE') && (
          <Button size="sm" onClick={(e) => { e.stopPropagation(); checkIn.mutate(r.id); }}>Check In</Button>
        )}
      </div>
    )},
  ];

  const filtered = (visitors ?? []).filter(
    (v) => !search || v.guestName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="text-heading text-text-1">Visitor Management</h1>
          <p className="text-body text-text-2 mt-0.5">Today's visitor requests</p>
        </div>
        <Button onClick={() => nav('/visitors/new')}><Plus className="h-4 w-4" /> New Request</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        {[
          { label: "Today's Visitors",  value: stats?.total     ?? 0, icon: Users,        iconGrad: 'linear-gradient(135deg,#7C3AED,#0EA5E9)', cardClass: 'metric-card-violet' },
          { label: 'Checked In',        value: stats?.checkedIn ?? 0, icon: UserCheck,    iconGrad: 'linear-gradient(135deg,#059669,#10B981)', cardClass: 'metric-card-green'  },
          { label: 'Pending Approval',  value: stats?.pending   ?? 0, icon: Clock,        iconGrad: 'linear-gradient(135deg,#D97706,#F59E0B)', cardClass: 'metric-card-amber'  },
          { label: 'Approved',          value: stats?.approved  ?? 0, icon: CheckCircle2, iconGrad: 'linear-gradient(135deg,#0EA5E9,#38BDF8)', cardClass: 'metric-card-blue'   },
        ].map((card) => (
          <div key={card.label} className={`${card.cardClass} flex items-center gap-4 relative overflow-hidden`}>
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shrink-0 shadow-glow-sm"
              style={{ background: card.iconGrad }}
            >
              <card.icon className="h-5 w-5" />
            </span>
            <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full opacity-20 blur-2xl" style={{ background: card.iconGrad }} />
            <div>
              <p className="text-[28px] font-extrabold text-text-1 leading-none tracking-tight">{card.value}</p>
              <p className="text-caption text-text-2 mt-1">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4 animate-fade-up" style={{ animationDelay: '150ms' }}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-2" />
          <Input className="pl-9" placeholder="Search guests…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
        <DataTable
          columns={columns} data={filtered} loading={isLoading}
          keyExtractor={(r) => r.id} onRowClick={(r) => nav(`/visitors/${r.id}`)}
        />
      </div>
    </div>
  );
}
