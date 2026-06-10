import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Download, Filter } from 'lucide-react';

function ExportButton({ endpoint, filename }: { endpoint: string; filename: string }) {
  const handleExport = async () => {
    const response = await api.get(endpoint);
    const rows: Record<string, unknown>[] = response.data?.data ?? [];
    const csv = [
      Object.keys(rows[0] ?? {}).join(','),
      ...rows.map((row) =>
        Object.values(row).map((v) => JSON.stringify(v ?? '')).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4 mr-1.5" /> Export CSV
    </Button>
  );
}

export default function Reports() {
  const [office, setOffice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const qs = new URLSearchParams();
  if (office && office !== 'ALL') qs.set('officeLocation', office);
  if (startDate) qs.set('startDate', new Date(startDate).toISOString());
  if (endDate) qs.set('endDate', new Date(endDate).toISOString());
  const qstr = qs.toString();

  const { data: visitorReport, isLoading: vLoading } = useQuery({
    queryKey: ['report-visitors', qstr],
    queryFn: () => api.get(`/reports/visitors?${qstr}`),
  });

  const { data: travelReport, isLoading: tLoading } = useQuery({
    queryKey: ['report-travel', qstr],
    queryFn: () => api.get(`/reports/travel?${qstr}`),
  });

  const { data: visaReport, isLoading: vizLoading } = useQuery({
    queryKey: ['report-visa'],
    queryFn: () => api.get('/reports/visa-expiry'),
  });

  const visitorCols: Column<Record<string, unknown>>[] = [
    { key: 'guestName', header: 'Guest', render: (r) => String(r.guestName) },
    { key: 'company', header: 'Company', render: (r) => String(r.company ?? '-') },
    { key: 'visitDate', header: 'Date', render: (r) => formatDate(String(r.visitDate)) },
    { key: 'officeLocation', header: 'Office', render: (r) => String(r.officeLocation) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={String(r.status)} /> },
  ];

  const travelCols: Column<Record<string, unknown>>[] = [
    { key: 'requestNumber', header: 'Request #', render: (r) => String(r.requestNumber) },
    { key: 'user', header: 'Employee', render: (r) => (r.user as { name: string })?.name },
    { key: 'destination', header: 'Destination', render: (r) => String(r.destination) },
    { key: 'travelType', header: 'Type', render: (r) => String(r.travelType) },
    { key: 'departureDate', header: 'Departure', render: (r) => formatDate(String(r.departureDate)) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={String(r.status)} /> },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="text-heading text-text-1">Reports</h1>
          <p className="text-body text-text-2 mt-0.5">Exportable data across all modules</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-end gap-4 mb-5 p-4 rounded-xl bg-card border border-border">
        <Filter className="h-4 w-4 text-text-2 mb-2.5 shrink-0" />
        <div className="space-y-1">
          <Label>Office</Label>
          <Select onValueChange={setOffice}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All offices" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="BANGALORE">Bangalore</SelectItem>
              <SelectItem value="PUNE">Pune</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>From</Label>
          <Input type="date" className="w-40" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>To</Label>
          <Input type="date" className="w-40" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <Tabs defaultValue="visitors">
        <TabsList>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
          <TabsTrigger value="travel">Travel</TabsTrigger>
          <TabsTrigger value="visa">Visa Expiry</TabsTrigger>
        </TabsList>

        <TabsContent value="visitors">
          <div className="flex justify-end mb-3">
            <ExportButton endpoint={`/reports/visitors?${qstr}`} filename="visitor-report" />
          </div>
          <DataTable columns={visitorCols} data={visitorReport?.data?.data ?? []} loading={vLoading} keyExtractor={(r) => String(r.id)} />
        </TabsContent>

        <TabsContent value="travel">
          <div className="flex justify-end mb-3">
            <ExportButton endpoint={`/reports/travel?${qstr}`} filename="travel-report" />
          </div>
          <DataTable columns={travelCols} data={travelReport?.data?.data ?? []} loading={tLoading} keyExtractor={(r) => String(r.id)} />
        </TabsContent>

        <TabsContent value="visa">
          <div className="flex justify-end mb-3">
            <ExportButton endpoint="/reports/visa-expiry" filename="visa-expiry-report" />
          </div>
          <DataTable
            columns={[
              { key: 'user', header: 'Employee', render: (r: Record<string, unknown>) => (r.user as { name: string })?.name },
              { key: 'country', header: 'Country', render: (r) => String(r.country) },
              { key: 'visaType', header: 'Type', render: (r) => String(r.visaType) },
              { key: 'expiryDate', header: 'Expiry', render: (r) => formatDate(String(r.expiryDate)) },
            ]}
            data={visaReport?.data?.data ?? []}
            loading={vizLoading}
            keyExtractor={(r) => String(r.id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
