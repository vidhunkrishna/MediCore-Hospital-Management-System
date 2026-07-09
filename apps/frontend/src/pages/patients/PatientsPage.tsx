import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PatientStatusBadge } from '@/components/shared/StatusBadge';
import { PatientModal } from './PatientModal';
import { PatientDetailDrawer } from './PatientDetailDrawer';
import { getInitials, getAge, formatDate } from '@/lib/utils';
import type { Patient, PatientStatus } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_FILTERS: { label: string; value: PatientStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Admitted', value: 'ADMITTED' },
  { label: 'Outpatient', value: 'OUTPATIENT' },
  { label: 'Critical', value: 'CRITICAL' },
  { label: 'Discharged', value: 'DISCHARGED' },
];

export function PatientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | ''>('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = usePatients({ q: debouncedSearch, status: statusFilter, page, limit: 10 });
  const patients = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 10);

  const openAdd = useCallback(() => { setEditPatient(null); setModalOpen(true); }, []);
  const openEdit = useCallback((p: Patient) => { setEditPatient(p); setModalOpen(true); setDetailId(null); }, []);
  const handleStatusChange = (s: PatientStatus | '') => { setStatusFilter(s); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Patients</h2>
          <p className="text-sm text-muted-foreground">{total} total records</p>
        </div>
        <Button onClick={openAdd} className="gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" /> New Patient
        </Button>
      </div>

      {/* Search + Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, MRN, phone..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => handleStatusChange(f.value)}
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
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Patient</span>
            <span>MRN</span>
            <span>Age / Gender</span>
            <span>Doctor</span>
            <span>Status</span>
            <span></span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-7 w-16 rounded-lg" />
                </div>
              ))}
            </div>
          ) : patients.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-16 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary/60 flex items-center justify-center">
                <Users className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No patients found</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {search || statusFilter ? 'Try adjusting your search or filters' : 'Register the first patient to get started'}
                </p>
              </div>
              {!search && !statusFilter && (
                <Button onClick={openAdd} variant="outline" size="sm" className="mt-1 gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add Patient
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="divide-y divide-border">
              {patients.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-secondary/30 transition-colors cursor-pointer group"
                  onClick={() => setDetailId(p.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarFallback className="text-xs">{getInitials(`${p.firstName} ${p.lastName}`)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-muted-foreground">Joined {formatDate(p.createdAt)}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground font-mono">{p.mrn}</span>
                  <span className="text-sm">{getAge(p.dob)}y · {p.gender.charAt(0)}</span>
                  <span className="text-sm text-muted-foreground truncate">{p.doctor?.name ?? '—'}</span>
                  <PatientStatusBadge status={p.status} />
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                    >
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
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pg = i + 1;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    pg === page ? 'gradient-primary text-white' : 'hover:bg-secondary text-muted-foreground'
                  }`}
                >
                  {pg}
                </button>
              );
            })}
            <Button size="icon" variant="outline" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Badge summary */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Admitted', count: patients.filter((p) => p.status === 'ADMITTED').length, variant: 'info' as const },
          { label: 'Critical', count: patients.filter((p) => p.status === 'CRITICAL').length, variant: 'destructive' as const },
          { label: 'Outpatient', count: patients.filter((p) => p.status === 'OUTPATIENT').length, variant: 'success' as const },
          { label: 'Discharged', count: patients.filter((p) => p.status === 'DISCHARGED').length, variant: 'secondary' as const },
        ].filter((s) => s.count > 0).map((s) => (
          <Badge key={s.label} variant={s.variant}>{s.label}: {s.count}</Badge>
        ))}
      </div>

      <PatientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        patient={editPatient}
      />

      <PatientDetailDrawer
        patientId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={() => {
          const p = patients.find((pt) => pt.id === detailId);
          if (p) openEdit(p);
        }}
      />
    </div>
  );
}
