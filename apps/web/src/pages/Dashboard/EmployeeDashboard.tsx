import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Plane, Users, Globe, MessageSquare,
  CreditCard, Calendar, Plus, ArrowRight,
} from 'lucide-react';

interface MyRequest { id: string; status: string; createdAt: string; destination?: string; guestName?: string; subject?: string; }

const QUICK_ACTIONS = [
  { label: 'New Visitor',    icon: Users,        to: '/visitors/new',    cardClass: 'metric-card-violet', iconGrad: 'linear-gradient(135deg,#7C3AED,#0EA5E9)' },
  { label: 'Travel Request', icon: Plane,        to: '/travel/new',      cardClass: 'metric-card-blue',   iconGrad: 'linear-gradient(135deg,#0EA5E9,#38BDF8)' },
  { label: 'Book Room',      icon: Calendar,     to: '/resources/book',  cardClass: 'metric-card-green',  iconGrad: 'linear-gradient(135deg,#059669,#10B981)' },
  { label: 'Raise Grievance',icon: MessageSquare,to: '/grievances/new',  cardClass: 'metric-card-amber',  iconGrad: 'linear-gradient(135deg,#D97706,#F59E0B)' },
];

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const nav = useNavigate();

  const { data: myTravel } = useQuery({
    queryKey: ['my-travel'],
    queryFn: () => api.get(`/travel?userId=${user?.id}&limit=5`),
    select: (res) => (res.data?.data ?? []) as MyRequest[],
    enabled: !!user,
  });

  const { data: myGrievances } = useQuery({
    queryKey: ['my-grievances'],
    queryFn: () => api.get(`/grievances?submittedById=${user?.id}&limit=5`),
    select: (res) => (res.data?.data ?? []) as MyRequest[],
    enabled: !!user,
  });

  const { data: myVisitors } = useQuery({
    queryKey: ['my-visitors'],
    queryFn: () => api.get(`/visitors?limit=5`),
    select: (res) => (res.data?.data ?? []) as MyRequest[],
    enabled: !!user,
  });

  const { data: idCard } = useQuery({
    queryKey: ['my-idcard'],
    queryFn: () => api.get('/idcards?limit=1'),
    select: (res) => (res.data?.data ?? []) as { status: string }[],
    enabled: !!user,
  });

  const cardStatus = (idCard ?? [])[0]?.status;

  return (
    <div className="page-enter">
      {/* Welcome */}
      <div className="mb-6 animate-fade-down">
        <h1 className="text-heading text-text-1">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-body text-text-2 mt-1">{user?.designation} · {user?.department} · {user?.officeLocation}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3 mb-6 stagger-children">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.to}
            onClick={() => nav(a.to)}
            className={`${a.cardClass} flex items-center gap-3 text-left w-full relative overflow-hidden`}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shrink-0 shadow-glow-sm"
              style={{ background: a.iconGrad }}
            >
              <a.icon className="h-5 w-5" />
            </div>
            <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full opacity-20 blur-xl" style={{ background: a.iconGrad }} />
            <div>
              <p className="text-body font-semibold text-text-1">{a.label}</p>
              <p className="flex items-center gap-1 text-caption text-text-2 mt-0.5">
                <Plus className="h-3 w-3" /> Create new
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ID Card status banner */}
      {cardStatus && cardStatus !== 'ISSUED' && (
        <div className="mb-6 flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <p className="text-body font-medium text-text-1">ID Card Status</p>
              <p className="text-caption text-text-2">Your ID card is currently being processed</p>
            </div>
          </div>
          <StatusBadge status={cardStatus} />
        </div>
      )}

      {/* My requests grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Travel requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-primary" /> Travel Requests
              </CardTitle>
              <Button variant="link" size="sm" onClick={() => nav('/travel')}>
                View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {(myTravel ?? []).length === 0 ? (
              <p className="text-caption text-text-2 text-center py-4">No travel requests</p>
            ) : (
              <ul className="space-y-3">
                {(myTravel ?? []).map((t) => (
                  <li key={t.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-body font-medium text-text-1">{t.destination}</p>
                      <p className="text-caption text-text-2">{formatDate(t.createdAt)}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Visitor requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> My Visitors
              </CardTitle>
              <Button variant="link" size="sm" onClick={() => nav('/visitors')}>
                View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {(myVisitors ?? []).length === 0 ? (
              <p className="text-caption text-text-2 text-center py-4">No visitors scheduled</p>
            ) : (
              <ul className="space-y-3">
                {(myVisitors ?? []).map((v) => (
                  <li key={v.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-body font-medium text-text-1">{v.guestName}</p>
                      <p className="text-caption text-text-2">{formatDate(v.createdAt)}</p>
                    </div>
                    <StatusBadge status={v.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Grievances */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> My Grievances
              </CardTitle>
              <Button variant="link" size="sm" onClick={() => nav('/grievances')}>
                View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {(myGrievances ?? []).length === 0 ? (
              <p className="text-caption text-text-2 text-center py-4">No open tickets</p>
            ) : (
              <ul className="space-y-3">
                {(myGrievances ?? []).map((g) => (
                  <li key={g.id} className="flex items-center justify-between">
                    <p className="text-body text-text-1 truncate max-w-[160px]">{g.subject}</p>
                    <StatusBadge status={g.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
