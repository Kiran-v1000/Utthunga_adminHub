import { useAuthStore } from '@/store/authStore';
import type { Role } from '@adminhub/shared';

export function usePermission() {
  const { user } = useAuthStore();

  function can(...roles: Role[]) {
    if (!user) return false;
    return roles.includes(user.role as Role);
  }

  function isAdmin() {
    return can('SUPER_ADMIN', 'FACILITY_MANAGER', 'ADMIN_EXECUTIVE');
  }

  function isSuperAdmin() {
    return can('SUPER_ADMIN');
  }

  return { can, isAdmin, isSuperAdmin, role: user?.role };
}
