import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Plus, Plane, Globe, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Travel {
  id: string; requestNumber: string; destination: string; travelType: string;
  departureDate: string; returnDate: string; status: string; costCenter: string;
  user: { name: string }; bu?: { name: string };
}

const STAT_CARDS = [
  { label: 'Total Requests', icon: Plane,        iconGrad: 'linear-gradient(135deg,#7C3AED,#0EA5E9)', cardClass: 'metric-card-violet', key: 'total' },
  { label: 'Pending Review', icon: Clock,        iconGrad: 'linear-gradient(135deg,#D97706,#F59E0B)', cardClass: 'metric-card-amber',  key: 'pending' },
  { label: 'Approved',       icon: CheckCircle2, iconGrad: 'linear-gradient(135deg,#059669,#10B981)', cardClass: 'metric-card-green',  key: 'approved' },
  { label: 'International',  icon: Globe,        iconGrad: 'linear-gradient(135deg,#0EA5E9,#38BDF8)', cardClass: 'metric-card-blue',   key: 'international' },
];

export default function TravelList() {
  const nav = useNavigate();

  const { data: travels, isLoading } = useQuery({
    queryKey: ['travel'],
    queryFn: () => api.get('/travel?limit=50'),
    select: (res) => (res.data?.data ?? []) as Travel[],
  });

  const list = travels ?? [];

  // Stats
  const stats = {
    total:         list.length,
    pending:       list.filter((t) => ['DRAFT', 'MANAGER_APPROVAL', 'BU_HEAD_APPROVAL', 'ADMIN_PROCESSING'].includes(t.status)).length,
    approved:      list.filter((t) => ['BOOKED', 'COMPLETED'].includes(t.status)).length,
    international: list.filter((t) => t.travelType === 'INTERNATIONAL').length,
  };

  const columns: Column<Travel>[] = [
    {
      key: 'requestNumber', header: 'Request #',
      render: (r) => (
        <span className="font-mono text-[13px] font-semibold text-primary">{r.requestNumber}</span>
      ),
    },
    {
      key: 'user', header: 'Employee',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-white text-[11px] font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#0EA5E9)' }}
          >
            {r.user.name.charAt(0)}
          </div>
          <span className="font-medium text-text-1">{r.user.name}</span>
        </div>
      ),
    },
    {
      key: 'destination', header: 'Destination',
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.travelType === 'INTERNATIONAL'
            ? <Globe  className="h-3.5 w-3.5 text-accent shrink-0" />
            : <Plane  className="h-3.5 w-3.5 text-primary/70 shrink-0" />}
          <span className="font-medium">{r.destination}</span>
        </div>
      ),
    },
    {
      key: 'travelType', header: 'Type',
      render: (r) => (
        <Badge
          variant={r.travelType === 'INTERNATIONAL' ? 'default' : 'outline'}
          className="text-[11px]"
        >
          {r.travelType}
        </Badge>
      ),
    },
    {
      key: 'departureDate', header: 'Travel Dates',
      render: (r) => (
        <div className="text-[13px]">
          <span className="font-medium text-text-1">{formatDate(r.departureDate)}</span>
          <span className="text-text-2 mx-1.5">→</span>
          <span className="text-text-2">{formatDate(r.returnDate)}</span>
        </div>
      ),
    },
    { key: 'costCenter', header: 'Cost Centre' },
    {
      key: 'status', header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="page-enter">
      {/* Page header */}
      <div className="page-header animate-fade-down">
        <div>
          <h1 className="text-heading text-text-1">Travel & Accommodation</h1>
          <p className="text-body text-text-2 mt-0.5">Manage travel requests and bookings</p>
        </div>
        <Button
          onClick={() => nav('/travel/new')}
          className="gap-2"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#0EA5E9)', border: 'none' }}
        >
          <Plus className="h-4 w-4" /> New Request
        </Button>
      </div>

      {/* Premium stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className={`${s.cardClass} relative overflow-hidden group`}>
            <div className="flex items-start justify-between mb-4">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-glow-sm"
                style={{ background: s.iconGrad }}
              >
                <s.icon className="h-5 w-5" />
              </span>
              <div
                className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-30"
                style={{ background: s.iconGrad }}
              />
            </div>
            <p className="text-[30px] font-extrabold text-text-1 leading-none tracking-tight">
              {stats[s.key as keyof typeof stats]}
            </p>
            <p className="text-body font-medium text-text-1 mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="animate-fade-up" style={{ animationDelay: '150ms' }}>
        <DataTable
          columns={columns}
          data={list}
          loading={isLoading}
          emptyMessage="No travel requests yet. Click 'New Request' to get started."
          keyExtractor={(r) => r.id}
          onRowClick={(r) => nav(`/travel/${r.id}`)}
        />
      </div>
    </div>
  );
}
