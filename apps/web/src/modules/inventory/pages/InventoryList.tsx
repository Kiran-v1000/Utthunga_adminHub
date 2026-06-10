import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface Item {
  id: string; itemCode: string; name: string; category: string;
  quantity: number; reorderLevel: number; unit: string;
  officeLocation: string; isLowStock: boolean; unitCost?: number;
}

export default function InventoryList() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => api.get('/inventory?limit=100'),
    select: (res) => (res.data?.data ?? []) as Item[],
  });

  const columns: Column<Item>[] = [
    { key: 'itemCode', header: 'Code', render: (r) => (
      <span className="font-mono text-caption font-medium text-primary">{r.itemCode}</span>
    )},
    { key: 'name', header: 'Item', render: (r) => (
      <div className="flex items-center gap-2">
        {r.isLowStock && <AlertTriangle className="h-3.5 w-3.5 text-danger shrink-0" />}
        <span className={cn(r.isLowStock && 'text-danger font-medium')}>{r.name}</span>
      </div>
    )},
    { key: 'category', header: 'Category', render: (r) => <Badge variant="outline">{r.category}</Badge> },
    { key: 'quantity', header: 'Stock', render: (r) => (
      <div>
        <p className={cn('font-semibold', r.isLowStock ? 'text-danger' : 'text-text-1')}>
          {r.quantity} {r.unit}
        </p>
        <p className="text-caption text-text-2">Reorder at {r.reorderLevel}</p>
      </div>
    )},
    { key: 'officeLocation', header: 'Location', render: (r) => <Badge variant="outline">{r.officeLocation}</Badge> },
    { key: 'actions', header: '', render: () => (
      <Button variant="secondary" size="sm">Adjust</Button>
    )},
  ];

  const lowStockCount = (items ?? []).filter((i) => i.isLowStock).length;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="text-heading text-text-1">Inventory Management</h1>
          <p className="text-body text-text-2 mt-0.5">Stock levels across offices</p>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="mb-4 flex items-center gap-3 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger animate-scale-in">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-body font-medium">
            {lowStockCount} item{lowStockCount > 1 ? 's' : ''} below reorder level
          </p>
        </div>
      )}

      <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
        <DataTable
          columns={columns} data={items ?? []} loading={isLoading}
          keyExtractor={(r) => r.id}
        />
      </div>
    </div>
  );
}
