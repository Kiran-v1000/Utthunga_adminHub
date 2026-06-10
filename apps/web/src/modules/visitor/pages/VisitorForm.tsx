import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { visitorRequestSchema } from '@adminhub/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import type { z } from 'zod';

type FormData = z.infer<typeof visitorRequestSchema>;

export default function VisitorForm() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(visitorRequestSchema),
    defaultValues: { hostId: user?.id ?? '', lunchRequired: false, snacksRequired: false },
  });

  const create = useMutation({
    mutationFn: (data: FormData) => api.post('/visitors', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visitors'] });
      nav('/visitors');
    },
  });

  return (
    <div className="max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="text-heading text-text-1">New Visitor Request</h1>
          <p className="text-body text-text-2">Schedule a visitor to your office</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Visitor Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => create.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="guestName">Guest Name *</Label>
                <Input id="guestName" {...register('guestName')} placeholder="John Doe" />
                {errors.guestName && <p className="text-caption text-danger">{errors.guestName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...register('company')} placeholder="Acme Corp" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guestEmail">Email</Label>
                <Input id="guestEmail" type="email" {...register('guestEmail')} placeholder="guest@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guestPhone">Phone</Label>
                <Input id="guestPhone" {...register('guestPhone')} placeholder="+91 98765 43210" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="purpose">Purpose of Visit *</Label>
              <Input id="purpose" {...register('purpose')} placeholder="Business meeting, Interview, etc." />
              {errors.purpose && <p className="text-caption text-danger">{errors.purpose.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Office Location *</Label>
                <Select onValueChange={(v) => setValue('officeLocation', v as never)}>
                  <SelectTrigger><SelectValue placeholder="Select office" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANGALORE">Bangalore</SelectItem>
                    <SelectItem value="PUNE">Pune</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="visitDate">Visit Date & Time *</Label>
                <Input id="visitDate" type="datetime-local" {...register('visitDate')} />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('lunchRequired')} className="rounded accent-primary" />
                <span className="text-body text-text-1">Lunch required</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('snacksRequired')} className="rounded accent-primary" />
                <span className="text-body text-text-1">Snacks required</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Submit Request'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => nav('/visitors')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
