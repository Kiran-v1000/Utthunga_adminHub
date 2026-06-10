import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';

const STATUS_MAP: Record<string, BadgeProps['variant']> = {
  // Generic
  PENDING: 'warning',
  ACTIVE: 'success',
  INACTIVE: 'muted',
  CANCELLED: 'muted',
  COMPLETED: 'success',
  REJECTED: 'danger',
  // Visitor
  APPROVED: 'success',
  CHECKED_IN: 'default',
  CHECKED_OUT: 'muted',
  // Travel
  DRAFT: 'muted',
  MANAGER_APPROVAL: 'warning',
  BU_HEAD_APPROVAL: 'warning',
  ADMIN_PROCESSING: 'default',
  BOOKED: 'success',
  // Grievance
  OPEN: 'danger',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  CLOSED: 'muted',
  REOPENED: 'danger',
  // Shipment
  RAISED: 'muted',
  ASSIGNED: 'default',
  PICKUP_SCHEDULED: 'warning',
  DISPATCHED: 'default',
  IN_TRANSIT: 'warning',
  DELIVERED: 'success',
  // Asset
  MAINTENANCE: 'warning',
  TRANSFERRED: 'default',
  DISPOSED: 'muted',
  // Priority
  CRITICAL: 'danger',
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'default',
};

interface Props {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: Props) {
  const variant = STATUS_MAP[status] ?? 'outline';
  return <Badge variant={variant}>{label ?? status.replace(/_/g, ' ')}</Badge>;
}
