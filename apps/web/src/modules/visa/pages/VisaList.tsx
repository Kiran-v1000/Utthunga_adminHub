import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, cn } from '@/lib/utils';
import { Plus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VisaRecord {
  id: string; visaNumber: string; country: string; visaType: string;
  expiryDate: string; daysUntilExpiry: number; passportNumber: string;
  user: { name: string; email: string; employeeId?: string };
}

export default function VisaList() {
  const nav = useNavigate();

  const { data: visas, isLoading } = useQuery({
    queryKey: ['visas'],
    queryFn: () => api.get('/visa?limit=50'),
    select: (res) => (res.data?.data ?? []) as VisaRecord[],
  });

  const columns: Column<VisaRecord>[] = [
    { key: 'user', header: 'Employee', render: (r) => (
      <div>
        <p className="font-medium text-text-1">{r.user.name}</p>
        <p className="text-caption text-text-2">{r.user.employeeId}</p>
      </div>
    )},
    { key: 'country', header: 'Country' },
    { key: 'visaType', header: 'Visa Type', render: (r) => <Badge variant="outline">{r.visaType}</Badge> },
    { key: 'visaNumber', header: 'Visa Number', render: (r) => <span className="font-mono text-caption">{r.visaNumber}</span> },
    { key: 'passportNumber', header: 'Passport #', render: (r) => <span className="font-mono text-caption">{r.passportNumber}</span> },
    { key: 'expiryDate', header: 'Expiry', render: (r) => (
      <div className="flex items-center gap-2">
        {r.daysUntilExpiry <= 30 && <AlertTriangle className="h-3.5 w-3.5 text-danger" />}
        {r.daysUntilExpiry > 30 && r.daysUntilExpiry <= 90 && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
        <div>
          <p className={cn(r.daysUntilExpiry <= 30 ? 'text-danger font-medium' : r.daysUntilExpiry <= 90 ? 'text-warning' : 'text-text-1')}>
            {formatDate(r.expiryDate)}
          </p>
          <p className="text-caption text-text-2">{r.daysUntilExpiry} days left</p>
        </div>
      </div>
    )},
  ];

  const expiringSoon = (visas ?? []).filter((v) => v.daysUntilExpiry <= 90).length;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="text-heading text-text-1">Visa Management</h1>
          <p className="text-body text-text-2 mt-0.5">Track employee visas and expiry alerts</p>
        </div>
        <Button onClick={() => nav('/visa/new')}><Plus className="h-4 w-4" /> Add Visa</Button>
      </div>

      {expiringSoon > 0 && (
        <div className="flex items-center gap-3 mb-4 p-4 rounded-xl bg-warning/10 border border-warning/30 text-warning animate-scale-in">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-body font-medium">
            {expiringSoon} visa{expiringSoon > 1 ? 's' : ''} expiring within 90 days
          </p>
        </div>
      )}

      <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
        <DataTable
          columns={columns} data={visas ?? []} loading={isLoading}
          keyExtractor={(r) => r.id} onRowClick={(r) => nav(`/visa/${r.id}`)}
        />
      </div>
    </div>
  );
}
