import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Asset {
  id: string; assetId: string; name: string; category: string; brand?: string;
  serialNumber?: string; status: string; officeLocation: string;
  purchaseCost?: number; currentValue?: number; warrantyExpiry?: string;
  owner?: { name: string };
}

export default function AssetList() {
  const nav = useNavigate();

  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => api.get('/assets?limit=50'),
    select: (res) => (res.data?.data ?? []) as Asset[],
  });

  const columns: Column<Asset>[] = [
    { key: 'assetId', header: 'Asset ID', render: (r) => (
      <span className="font-mono text-caption font-medium text-primary">{r.assetId}</span>
    )},
    { key: 'name', header: 'Asset', render: (r) => (
      <div>
        <p className="font-medium text-text-1">{r.name}</p>
        <p className="text-caption text-text-2">{r.brand} {r.category}</p>
      </div>
    )},
    { key: 'serialNumber', header: 'Serial #', render: (r) => (
      <span className="font-mono text-caption">{r.serialNumber ?? '-'}</span>
    )},
    { key: 'owner', header: 'Assigned To', render: (r) => r.owner?.name ?? 'Unassigned' },
    { key: 'officeLocation', header: 'Location', render: (r) => <Badge variant="outline">{r.officeLocation}</Badge> },
    { key: 'currentValue', header: 'Value', render: (r) => r.currentValue ? formatCurrency(r.currentValue) : '-' },
    { key: 'warrantyExpiry', header: 'Warranty', render: (r) => r.warrantyExpiry ? formatDate(r.warrantyExpiry) : '-' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="text-heading text-text-1">Asset Tracking</h1>
          <p className="text-body text-text-2 mt-0.5">Non-IT asset register and lifecycle</p>
        </div>
        <Button onClick={() => nav('/assets/new')}><Plus className="h-4 w-4" /> Add Asset</Button>
      </div>
      <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
        <DataTable
          columns={columns} data={assets ?? []} loading={isLoading}
          keyExtractor={(r) => r.id} onRowClick={(r) => nav(`/assets/${r.id}`)}
        />
      </div>
    </div>
  );
}
