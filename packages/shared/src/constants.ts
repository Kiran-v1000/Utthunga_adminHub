export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  FACILITY_MANAGER: 'FACILITY_MANAGER',
  ADMIN_EXECUTIVE: 'ADMIN_EXECUTIVE',
  HR_TEAM: 'HR_TEAM',
  FINANCE_TEAM: 'FINANCE_TEAM',
  REPORTING_MANAGER: 'REPORTING_MANAGER',
  BU_HEAD: 'BU_HEAD',
  RECEPTIONIST: 'RECEPTIONIST',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const OFFICE_LOCATIONS = {
  BANGALORE: 'BANGALORE',
  PUNE: 'PUNE',
} as const;

export type OfficeLocation = (typeof OFFICE_LOCATIONS)[keyof typeof OFFICE_LOCATIONS];

export const GRIEVANCE_SLA_HOURS: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 24,
  MEDIUM: 72,
  LOW: 120,
};

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
};

export const VISA_ALERT_DAYS = [180, 90, 30] as const;

export const ADMIN_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.FACILITY_MANAGER,
  ROLES.ADMIN_EXECUTIVE,
];
