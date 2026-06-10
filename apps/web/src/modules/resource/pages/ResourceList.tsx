import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { Plus, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Room {
  id: string; name: string; type: string; capacity: number;
  floor?: string; officeLocation: string; equipment: string[];
}
interface Booking {
  id: string; title: string; startTime: string; endTime: string; status: string;
  room: { name: string; type: string }; bookedBy: { name: string }; attendees?: number;
}

export default function ResourceList() {
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.get('/resources/rooms'),
    select: (res) => (res.data?.data ?? []) as Room[],
  });

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/resources/bookings?limit=50'),
    select: (res) => (res.data?.data ?? []) as Booking[],
  });

  const cancel = useMutation({
    mutationFn: (id: string) => api.patch(`/resources/bookings/${id}/cancel`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });

  const bookingCols: Column<Booking>[] = [
    { key: 'title', header: 'Meeting', render: (r) => <p className="font-medium">{r.title}</p> },
    { key: 'room', header: 'Room', render: (r) => (
      <div>
        <p className="font-medium text-text-1">{r.room.name}</p>
        <p className="text-caption text-text-2">{r.room.type}</p>
      </div>
    )},
    { key: 'bookedBy', header: 'Booked By', render: (r) => r.bookedBy.name },
    { key: 'startTime', header: 'Time', render: (r) => (
      <span>{formatDateTime(r.startTime)} → {formatDateTime(r.endTime)}</span>
    )},
    { key: 'attendees', header: 'Attendees', render: (r) => r.attendees ?? '-' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', header: '', render: (r) => r.status === 'CONFIRMED' ? (
      <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); cancel.mutate(r.id); }}>Cancel</Button>
    ) : null },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="text-heading text-text-1">Resource Booking</h1>
          <p className="text-body text-text-2 mt-0.5">Book meeting rooms and resources</p>
        </div>
        <Button onClick={() => nav('/resources/book')}><Plus className="h-4 w-4" /> Book Room</Button>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
        <Tabs defaultValue="bookings">
          <TabsList>
            <TabsTrigger value="bookings"><Calendar className="h-4 w-4 mr-1.5" />Bookings</TabsTrigger>
            <TabsTrigger value="rooms">Available Rooms</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings">
            <DataTable columns={bookingCols} data={bookings ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
          </TabsContent>
          <TabsContent value="rooms">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 stagger-children">
              {(rooms ?? []).map((room) => (
                <div key={room.id} className="metric-card cursor-pointer hover:border-primary/40">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="default">{room.type}</Badge>
                    <Badge variant="outline">{room.officeLocation}</Badge>
                  </div>
                  <h3 className="text-subhead text-text-1">{room.name}</h3>
                  <p className="text-caption text-text-2 mt-1">Floor {room.floor} · {room.capacity} pax</p>
                  {room.equipment.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {room.equipment.map((eq) => (
                        <span key={eq} className="text-[11px] bg-surface rounded px-1.5 py-0.5 text-text-2">{eq}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
