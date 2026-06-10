import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, LogOut, Sun, Moon, Menu } from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { getInitials, cn } from '@/lib/utils';
import { api } from '@/lib/axios';

const ROUTE_LABELS: Record<string, string> = {
  dashboard:  'Dashboard',
  visitors:   'Visitor Management',
  travel:     'Travel & Accommodation',
  visa:       'Visa Management',
  shipments:  'Shipment Management',
  grievances: 'Employee Grievance',
  resources:  'Resource Booking',
  assets:     'Asset Tracking',
  inventory:  'Inventory Management',
  idcards:    'ID Card Management',
  reports:    'Reports',
  settings:   'Settings',
};

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((part, i) => ({
    label: ROUTE_LABELS[part] ?? part.charAt(0).toUpperCase() + part.slice(1),
    to: '/' + parts.slice(0, i + 1).join('/'),
    isLast: i === parts.length - 1,
  }));
}

export function Topbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { toggle: toggleSidebar, collapsed } = useSidebarStore();
  const crumbs = useBreadcrumbs();

  const handleLogout = async () => {
    await api.post('/auth/logout').catch(() => {});
    logout();
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 flex h-16 items-center justify-between px-5',
        'bg-card/95 backdrop-blur-md border-b border-border',
        'transition-all duration-300 ease-in-out',
      )}
      style={{ left: collapsed ? 68 : 256 }}
    >
      {/* Left: sidebar toggle + breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Sidebar hamburger toggle */}
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-2 hover:text-text-1 hover:bg-surface transition-all duration-150 shrink-0"
          title="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-caption text-text-2 min-w-0 overflow-hidden">
          <Link to="/dashboard" className="hover:text-primary transition-colors shrink-0">Home</Link>
          {crumbs.map((crumb) => (
            <React.Fragment key={crumb.to}>
              <ChevronRight className="h-3 w-3 shrink-0 text-text-2/40" />
              {crumb.isLast ? (
                <span className="text-text-1 font-semibold truncate">{crumb.label}</span>
              ) : (
                <Link to={crumb.to} className="hover:text-primary transition-colors shrink-0">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: theme toggle, notifications, user */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Dark / Light mode toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border border-border',
            'text-text-2 hover:text-text-1 hover:bg-surface transition-all duration-150',
          )}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark'
            ? <Sun  className="h-4 w-4 text-amber-400" />
            : <Moon className="h-4 w-4" />
          }
        </button>

        <NotificationDrawer />

        {/* User avatar + dropdown */}
        <div className="group relative">
          <button className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-surface transition-all duration-150 border border-transparent hover:border-border">
            {/* Gradient avatar */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold shadow-glow-sm"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#0EA5E9)' }}
            >
              {user ? getInitials(user.name) : '??'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-semibold text-text-1 leading-tight">{user?.name}</p>
              <p className="text-[11px] text-text-2 leading-tight">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
          </button>

          {/* Dropdown */}
          <div
            className={cn(
              'absolute right-0 top-full mt-2 hidden w-52 rounded-2xl border border-border bg-card',
              'shadow-modal overflow-hidden group-focus-within:block',
            )}
          >
            <div className="p-4 border-b border-border"
              style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.07),rgba(14,165,233,0.04))' }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold mb-2 shadow-glow-sm"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#0EA5E9)' }}
              >
                {user ? getInitials(user.name) : '??'}
              </div>
              <p className="text-body font-semibold text-text-1 leading-tight">{user?.name}</p>
              <p className="text-caption text-text-2 truncate">{user?.email}</p>
            </div>
            <div className="p-1.5">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-danger hover:bg-danger/8 transition-colors rounded-xl"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
