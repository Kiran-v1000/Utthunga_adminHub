import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Shipment {
  id: string; requestNumber: string; type: string;
  senderName: string; receiverName: string;
  courierPartner?: { name: string }; trackingNumber?: string;
  pickupDate?: string; status: string; officeLocation: string;
  requester: { name: string };
}

export default function ShipmentList() {
  const nav = useNavigate();

  const { data: shipments, isLoading } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => api.get('/shipments?limit=50'),
    select: (res) => (res.data?.data ?? []) as Shipment[],
  });

  const columns: Column<Shipment>[] = [
    { key: 'requestNumber', header: 'Request #', render: (r) => (
      <span className="font-mono text-caption font-medium text-primary">{r.requestNumber}</span>
    )},
    { key: 'type', header: 'Type', render: (r) => (
      <div className="flex items-center gap-1.5">
        {r.type === 'OUTBOUND'
          ? <ArrowUpCircle className="h-4 w-4 text-primary" />
          : <ArrowDownCircle className="h-4 w-4 text-success" />}
        <Badge variant={r.type === 'OUTBOUND' ? 'default' : 'outline'}>{r.type}</Badge>
      </div>
    )},
    { key: 'senderName', header: 'From' },
    { key: 'receiverName', header: 'To' },
    { key: 'courierPartner', header: 'Courier', render: (r) => r.courierPartner?.name ?? '-' },
    { key: 'trackingNumber', header: 'Tracking #', render: (r) => (
      <span className="font-mono text-caption">{r.trackingNumber ?? '-'}</span>
    )},
    { key: 'pickupDate', header: 'Pickup', render: (r) => r.pickupDate ? formatDate(r.pickupDate) : '-' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="text-heading text-text-1">Shipment Management</h1>
          <p className="text-body text-text-2 mt-0.5">Track inbound and outbound shipments</p>
        </div>
        <Button onClick={() => nav('/shipments/new')}><Plus className="h-4 w-4" /> New Shipment</Button>
      </div>
      <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
        <DataTable
          columns={columns} data={shipments ?? []} loading={isLoading}
          keyExtractor={(r) => r.id} onRowClick={(r) => nav(`/shipments/${r.id}`)}
        />
      </div>
    </div>
  );
}
