import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, cn } from '@/lib/utils';
import { Plus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Ticket {
  id: string; ticketNumber: string; subject: string;
  category: string; priority: string; status: string;
  officeLocation: string; slaBreached: boolean; dueAt?: string;
  submittedBy: { name: string }; _count: { comments: number }; createdAt: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: 'bg-danger/10 text-danger',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-warning/10 text-warning',
  LOW: 'bg-primary/10 text-primary',
};

export default function GrievanceList() {
  const nav = useNavigate();
  const [tab, setTab] = useState('OPEN');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['grievances', tab],
    queryFn: () => api.get(`/grievances?status=${tab}&limit=50`),
    select: (res) => (res.data?.data ?? []) as Ticket[],
  });

  const columns: Column<Ticket>[] = [
    { key: 'ticketNumber', header: 'Ticket #', render: (r) => (
      <span className="font-mono text-caption font-medium text-primary">{r.ticketNumber}</span>
    )},
    { key: 'subject', header: 'Subject', render: (r) => (
      <div className="flex items-center gap-2">
        {r.slaBreached && <AlertTriangle className="h-3.5 w-3.5 text-danger shrink-0" />}
        <span className={cn(r.slaBreached && 'text-danger font-medium')}>{r.subject}</span>
      </div>
    )},
    { key: 'category', header: 'Category', render: (r) => <Badge variant="outline">{r.category}</Badge> },
    { key: 'priority', header: 'Priority', render: (r) => (
      <span className={cn('status-badge', PRIORITY_COLOR[r.priority])}>{r.priority}</span>
    )},
    { key: 'submittedBy', header: 'Raised By', render: (r) => r.submittedBy.name },
    { key: 'dueAt', header: 'SLA Due', render: (r) => r.dueAt ? formatDate(r.dueAt) : '-' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="text-heading text-text-1">Employee Grievances</h1>
          <p className="text-body text-text-2 mt-0.5">Track and resolve employee concerns</p>
        </div>
        <Button onClick={() => nav('/grievances/new')}><Plus className="h-4 w-4" /> Raise Ticket</Button>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
        <Tabs value={tab} onValueChange={setTab} className="mb-4">
          <TabsList>
            {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
              <TabsTrigger key={s} value={s}>{s.replace(/_/g, ' ')}</TabsTrigger>
            ))}
          </TabsList>
          {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
            <TabsContent key={s} value={s}>
              <DataTable
                columns={columns} data={tickets ?? []} loading={isLoading}
                keyExtractor={(r) => r.id} onRowClick={(r) => nav(`/grievances/${r.id}`)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
