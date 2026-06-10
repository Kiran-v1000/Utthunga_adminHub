import React from 'react';
import { useAuthStore } from '@/store/authStore';
import EmployeeDashboard from './EmployeeDashboard';
import AdminDashboard from './AdminDashboard';
import LeadershipDashboard from './LeadershipDashboard';

const LEADERSHIP_ROLES = ['BU_HEAD', 'REPORTING_MANAGER', 'FINANCE_TEAM'];
const ADMIN_ROLES = ['SUPER_ADMIN', 'FACILITY_MANAGER', 'ADMIN_EXECUTIVE', 'RECEPTIONIST', 'HR_TEAM'];

export default function Dashboard() {
  const { user } = useAuthStore();
  if (!user) return null;

  if (LEADERSHIP_ROLES.includes(user.role)) return <LeadershipDashboard />;
  if (ADMIN_ROLES.includes(user.role)) return <AdminDashboard />;
  return <EmployeeDashboard />;
}
