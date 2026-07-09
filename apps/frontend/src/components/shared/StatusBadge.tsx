import { Badge } from '@/components/ui/badge';
import type { PatientStatus, AppointmentStatus, AlertSeverity } from '@/types';

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  const map: Record<PatientStatus, { variant: 'default' | 'destructive' | 'success' | 'warning' | 'info' | 'secondary' | 'outline'; label: string }> = {
    ADMITTED: { variant: 'info', label: 'Admitted' },
    OUTPATIENT: { variant: 'success', label: 'Outpatient' },
    CRITICAL: { variant: 'destructive', label: 'Critical' },
    DISCHARGED: { variant: 'secondary', label: 'Discharged' },
  };
  const { variant, label } = map[status] ?? { variant: 'secondary', label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, { variant: 'default' | 'destructive' | 'success' | 'warning' | 'info' | 'secondary' | 'outline'; label: string }> = {
    SCHEDULED: { variant: 'default', label: 'Scheduled' },
    CONFIRMED: { variant: 'info', label: 'Confirmed' },
    IN_PROGRESS: { variant: 'warning', label: 'In Progress' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    CANCELLED: { variant: 'destructive', label: 'Cancelled' },
  };
  const { variant, label } = map[status] ?? { variant: 'secondary', label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

export function AlertSeverityBadge({ severity }: { severity: AlertSeverity }) {
  const map: Record<AlertSeverity, { variant: 'default' | 'destructive' | 'success' | 'warning' | 'info' | 'secondary' | 'outline'; label: string }> = {
    LOW: { variant: 'secondary', label: 'Low' },
    MEDIUM: { variant: 'warning', label: 'Medium' },
    HIGH: { variant: 'default', label: 'High' },
    CRITICAL: { variant: 'destructive', label: 'Critical' },
  };
  const { variant, label } = map[severity] ?? { variant: 'secondary', label: severity };
  return <Badge variant={variant}>{label}</Badge>;
}
