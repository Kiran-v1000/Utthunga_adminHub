import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Unauthorized() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <ShieldX className="h-16 w-16 text-danger mx-auto mb-4 opacity-60" />
        <h1 className="text-heading text-text-1 mb-2">Access Denied</h1>
        <p className="text-body text-text-2 mb-6">You don't have permission to view this page.</p>
        <Button onClick={() => nav('/dashboard')}>Back to Dashboard</Button>
      </div>
    </div>
  );
}
