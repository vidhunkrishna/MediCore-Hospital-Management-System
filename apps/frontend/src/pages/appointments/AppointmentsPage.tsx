import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAppointments, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppointmentStatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { AppointmentModal } from './AppointmentModal';
import { formatDateTime } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types';
import { useUIStore } from '@/store/ui.store';

const STATUS_FILTERS: { label: string; value: AppointmentStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const TYPE_COLORS: Record<string, string> = {
  CONSULTATION: 'text-indigo-400',
  FOLLOW_UP: 'text-cyan-400',
  PROCEDURE: 'text-amber-400',
  EMERGENCY: 'text-red-400',
};

const NEXT_STATUS: Record<string, string> = {
  SCHEDULED: 'CONFIRMED',
  CONFIRMED: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
};

export function AppointmentsPage() {
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);
  const addToast = useUIStore((s) => s.addToast);

  const { data, isLoading } = useAppointments({ status: statusFilter, page, limit: 10 });
  const appointments = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 10);

  const updateStatus = useUpdateAppointmentStatus();

  const openAdd = useCallback(() => { setEditAppt(null); setModalOpen(true); }, []);
  const openEdit = useCallback((a: Appointment) => { setEditAppt(a); setModalOpen(true); }, []);

  const advance = async (appt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = NEXT_STATUS[appt.status];
    if (!next) return;
    try {
      await updateStatus.mutateAsync({ id: appt.id, status: next });
      addToast({ title: 'Status updated', variant: 'success' });
    } catch {
      addToast({ title: 'Error updating status', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5 max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-lg font-bold tracking-tight">Appointments</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{total} total appointments</p>
        </div>
        <Button onClick={openAdd} className="gap-2 flex-shrink-0 h-9 text-sm">
          <Plus className="w-4 h-4" /> Schedule
        </Button>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search appointments..." className="pl-9" readOnly />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setStatusFilter(f.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  statusFilter === f.value
                    ? 'gradient-primary text-white shadow-sm'
                    : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-muted/30 border-y border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            <span>Patient</span>
            <span>Doctor</span>
            <span>Date & Time</span>
            <span>Type</span>
            <span>Status</span>
            <span></span>
          </div>

          {isLoading ? (
            <TableSkeleton rows={8} cols={6} gridTemplateColumns="2fr 1.5fr 1.5fr 1fr 1fr auto" />
          ) : appointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No appointments found"
              description="Schedule the first appointment to get started"
              action={{ label: 'Schedule Appointment', onClick: openAdd, icon: Plus }}
            />
          ) : (
            <div className="divide-y divide-border">
              {appointments.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center border-b border-border/40 last:border-0 transition-colors ${i % 2 !== 0 ? 'bg-muted/[0.015]' : ''} hover:bg-muted/30 group cursor-pointer`}
                  onClick={() => openEdit(a)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">{a.patient?.mrn}</p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{a.doctor?.name ?? '—'}</p>
                  <div>
                    <p className="text-sm">{formatDateTime(a.scheduledAt)}</p>
                    <p className="text-xs text-muted-foreground">{a.duration} min</p>
                  </div>
                  <span className={`text-xs font-medium ${TYPE_COLORS[a.type] ?? ''}`}>
                    {a.type.replace('_', ' ')}
                  </span>
                  <AppointmentStatusBadge status={a.status} />
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    {NEXT_STATUS[a.status] && (
                      <Button size="sm" variant="outline" className="h-7 text-xs whitespace-nowrap" onClick={(e) => advance(a, e)}>
                        → {NEXT_STATUS[a.status].replace('_', ' ')}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); openEdit(a); }}>
                      Edit
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setPage(pg)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${pg === page ? 'gradient-primary text-white' : 'hover:bg-secondary text-muted-foreground'}`}
              >
                {pg}
              </button>
            ))}
            <Button size="icon" variant="outline" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Summary badges */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.filter((f) => f.value).map((f) => {
          const count = appointments.filter((a) => a.status === f.value).length;
          if (!count) return null;
          return <Badge key={f.value} variant="secondary">{f.label}: {count}</Badge>;
        })}
      </div>

      <AppointmentModal open={modalOpen} onClose={() => setModalOpen(false)} appointment={editAppt} />
    </div>
  );
}
