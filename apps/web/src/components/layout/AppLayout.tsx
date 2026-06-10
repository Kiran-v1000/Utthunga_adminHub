import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';
import { useSidebarStore } from '@/store/sidebarStore';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const { collapsed } = useSidebarStore();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface">
        <Sidebar />

        {/* Main content shifts with sidebar */}
        <div
          className={cn(
            'transition-all duration-300 ease-in-out',
            collapsed ? 'ml-[68px]' : 'ml-64',
          )}
        >
          <Topbar />
          <main className="pt-16 min-h-screen">
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}
