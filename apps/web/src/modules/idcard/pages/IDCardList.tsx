import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface IDCard {
  id: string; cardNumber?: string; employeeType: string; status: string;
  issuedAt?: string; printedAt?: string; createdAt: string;
  user: { name: string; email: string; employeeId?: string; officeLocation: string };
}

const NEXT_STATUS: Record<string, string> = {
  ADMIN_NOTIFIED: 'GENERATED',
  GENERATED: 'PRINTED',
  PRINTED: 'ISSUED',
};

export default function IDCardList() {
  const qc = useQueryClient();

  const { data: cards, isLoading } = useQuery({
    queryKey: ['idcards'],
    queryFn: () => api.get('/idcards?limit=50'),
    select: (res) => (res.data?.data ?? []) as IDCard[],
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/idcards/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['idcards'] }),
  });

  const columns: Column<IDCard>[] = [
    { key: 'user', header: 'Employee', render: (r) => (
      <div>
        <p className="font-medium text-text-1">{r.user.name}</p>
        <p className="text-caption text-text-2">{r.user.email}</p>
      </div>
    )},
    { key: 'employeeType', header: 'Type', render: (r) => <Badge variant="outline">{r.employeeType}</Badge> },
    { key: 'cardNumber', header: 'Card #', render: (r) => (
      <span className="font-mono text-caption">{r.cardNumber ?? 'Not assigned'}</span>
    )},
    { key: 'officeLocation', header: 'Office', render: (r) => <Badge variant="outline">{r.user.officeLocation}</Badge> },
    { key: 'printedAt', header: 'Printed', render: (r) => r.printedAt ? formatDate(r.printedAt) : '-' },
    { key: 'issuedAt', header: 'Issued', render: (r) => r.issuedAt ? formatDate(r.issuedAt) : '-' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', header: '', render: (r) => {
      const next = NEXT_STATUS[r.status];
      if (!next) return null;
      return (
        <Button size="sm" onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: r.id, status: next }); }}>
          Mark {next.replace(/_/g, ' ')}
        </Button>
      );
    }},
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="text-heading text-text-1">ID Card Management</h1>
          <p className="text-body text-text-2 mt-0.5">Issuance queue and exit collection</p>
        </div>
      </div>
      <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
        <DataTable
          columns={columns} data={cards ?? []} loading={isLoading}
          keyExtractor={(r) => r.id}
        />
      </div>
    </div>
  );
}
