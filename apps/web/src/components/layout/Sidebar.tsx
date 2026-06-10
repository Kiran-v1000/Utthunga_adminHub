import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useSidebarStore } from '@/store/sidebarStore';
import {
  LayoutDashboard, Users, Plane, Globe, Package, MessageSquare,
  Calendar, Monitor, Archive, CreditCard,
  BarChart2, Settings, ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react';
import type { Role } from '@adminhub/shared';

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  roles: Role[];
  /** Icon colour shown when idle (Tailwind text-* or hex) */
  color: string;
  /** Tinted pill background on active */
  activeBg: string;
  /** Active icon colour */
  activeColor: string;
  /** Dot colour when collapsed + active */
  dot: string;
}

const ALL_ROLES: Role[] = [
  'SUPER_ADMIN', 'FACILITY_MANAGER', 'ADMIN_EXECUTIVE', 'HR_TEAM',
  'FINANCE_TEAM', 'REPORTING_MANAGER', 'BU_HEAD', 'RECEPTIONIST', 'EMPLOYEE',
];
const ADMIN_ROLES: Role[] = ['SUPER_ADMIN', 'FACILITY_MANAGER', 'ADMIN_EXECUTIVE'];

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',  to: '/dashboard',  icon: LayoutDashboard, roles: ALL_ROLES,
    color: '#a78bfa',   activeBg: 'rgba(139,92,246,0.18)',  activeColor: '#c4b5fd', dot: '#a78bfa',
  },
  {
    label: 'Visitors',   to: '/visitors',   icon: Users,           roles: ALL_ROLES,
    color: '#60a5fa',   activeBg: 'rgba(96,165,250,0.18)',   activeColor: '#93c5fd', dot: '#60a5fa',
  },
  {
    label: 'Travel',     to: '/travel',     icon: Plane,           roles: ALL_ROLES,
    color: '#f472b6',   activeBg: 'rgba(244,114,182,0.18)',  activeColor: '#f9a8d4', dot: '#f472b6',
  },
  {
    label: 'Visa',       to: '/visa',       icon: Globe,           roles: ALL_ROLES,
    color: '#34d399',   activeBg: 'rgba(52,211,153,0.18)',   activeColor: '#6ee7b7', dot: '#34d399',
  },
  {
    label: 'Shipments',  to: '/shipments',  icon: Package,         roles: ALL_ROLES,
    color: '#fb923c',   activeBg: 'rgba(251,146,60,0.18)',   activeColor: '#fdba74', dot: '#fb923c',
  },
  {
    label: 'Grievances', to: '/grievances', icon: MessageSquare,   roles: ALL_ROLES,
    color: '#f87171',   activeBg: 'rgba(248,113,113,0.18)',  activeColor: '#fca5a5', dot: '#f87171',
  },
  {
    label: 'Resources',  to: '/resources',  icon: Calendar,        roles: ALL_ROLES,
    color: '#4ade80',   activeBg: 'rgba(74,222,128,0.18)',   activeColor: '#86efac', dot: '#4ade80',
  },
  {
    label: 'Assets',     to: '/assets',     icon: Monitor,         roles: [...ADMIN_ROLES, 'FINANCE_TEAM'],
    color: '#38bdf8',   activeBg: 'rgba(56,189,248,0.18)',   activeColor: '#7dd3fc', dot: '#38bdf8',
  },
  {
    label: 'Inventory',  to: '/inventory',  icon: Archive,         roles: ADMIN_ROLES,
    color: '#fbbf24',   activeBg: 'rgba(251,191,36,0.18)',   activeColor: '#fcd34d', dot: '#fbbf24',
  },
  {
    label: 'ID Cards',   to: '/idcards',    icon: CreditCard,      roles: [...ADMIN_ROLES, 'HR_TEAM'],
    color: '#e879f9',   activeBg: 'rgba(232,121,249,0.18)',  activeColor: '#f0abfc', dot: '#e879f9',
  },
  {
    label: 'Reports',    to: '/reports',    icon: BarChart2,       roles: [...ADMIN_ROLES, 'FINANCE_TEAM', 'REPORTING_MANAGER', 'BU_HEAD'],
    color: '#a3e635',   activeBg: 'rgba(163,230,53,0.18)',   activeColor: '#bef264', dot: '#a3e635',
  },
  {
    label: 'Settings',   to: '/settings',   icon: Settings,        roles: ADMIN_ROLES,
    color: '#94a3b8',   activeBg: 'rgba(148,163,184,0.18)',  activeColor: '#cbd5e1', dot: '#94a3b8',
  },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebarStore();
  const { user } = useAuthStore();
  const location = useLocation();

  const visible = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role as Role),
  );

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-64',
      )}
      style={{ background: 'linear-gradient(180deg,#0f0d1e 0%,#160f2e 55%,#0f0d1e 100%)' }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className={cn(
        'flex h-16 items-center border-b border-white/10 shrink-0 transition-all duration-300',
        collapsed ? 'justify-center' : 'gap-3 px-4',
      )}>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-glow-sm"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#0EA5E9)' }}
        >
          <Sparkles style={{ height: 18, width: 18, color: '#fff' }} />
        </div>

        {!collapsed && (
          <div className="overflow-hidden animate-fade-up">
            <p className="text-[15px] font-bold text-white leading-tight tracking-tight">Utthunga</p>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-violet-400/80 uppercase">AdminHub</p>
          </div>
        )}
      </div>

      {/* ── Nav items ────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-0.5">
        {visible.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-medium',
                'transition-all duration-150 cursor-pointer relative',
                !active && 'hover:bg-white/5',
                collapsed && 'justify-center',
              )}
              style={active ? { background: item.activeBg } : undefined}
            >
              {/* Coloured icon bubble */}
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150',
                  active ? 'scale-110' : 'opacity-75 group-hover:opacity-100',
                )}
                style={{ color: active ? item.activeColor : item.color }}
              >
                <Icon className="h-[17px] w-[17px]" />
              </span>

              {!collapsed && (
                <span
                  className="truncate transition-colors duration-150"
                  style={{ color: active ? item.activeColor : 'rgba(255,255,255,0.65)' }}
                >
                  {item.label}
                </span>
              )}

              {/* Left accent bar on active */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: item.color }}
                />
              )}

              {/* Active dot when collapsed */}
              {collapsed && active && (
                <span
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full"
                  style={{ background: item.dot }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="mx-3 h-px bg-white/10" />

      {/* ── Collapse toggle ──────────────────────────────── */}
      <button
        onClick={toggle}
        className={cn(
          'flex h-12 items-center gap-2 px-4 text-white/30 hover:text-white/70 transition-all duration-150 hover:bg-white/5',
          collapsed && 'justify-center px-0',
        )}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight className="h-4 w-4" />
          : <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="text-[12px] font-medium">Collapse</span>
            </>
        }
      </button>
    </aside>
  );
}
