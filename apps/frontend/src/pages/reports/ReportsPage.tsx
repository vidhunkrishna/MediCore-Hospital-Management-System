import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Users, Calendar, BedDouble, Activity, BarChart3 } from 'lucide-react';
import { useOverview } from '@/hooks/useAnalytics';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PatientStatusBadge, AppointmentStatusBadge } from '@/components/shared/StatusBadge';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate, formatDateTime, getAge } from '@/lib/utils';

type ReportType = 'patients' | 'appointments' | 'occupancy';

const REPORT_TABS: { id: ReportType; icon: React.ElementType; title: string; description: string }[] = [
  { id: 'patients',     icon: Users,     title: 'Patient Summary',    description: 'Full roster with status & demographics' },
  { id: 'appointments', icon: Calendar,  title: 'Appointments',       description: 'Scheduled and completed sessions' },
  { id: 'occupancy',    icon: BedDouble, title: 'Occupancy',          description: 'Bed utilization & capacity metrics' },
];

function exportToCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const [active, setActive] = useState<ReportType>('patients');
  const { data: overview,     isLoading: overviewLoading } = useOverview();
  const { data: patientsData, isLoading: patientsLoading } = usePatients({ limit: 100 });
  const { data: apptData,     isLoading: apptLoading }     = useAppointments({ limit: 100 });

  const patients     = patientsData?.data ?? [];
  const appointments = apptData?.data ?? [];

  const handleExport = () => {
    if (active === 'patients') {
      exportToCSV('patients', [
        ['MRN', 'First Name', 'Last Name', 'Age', 'Gender', 'Blood Type', 'Phone', 'Status', 'Doctor', 'Admitted'],
        ...patients.map((p) => [p.mrn, p.firstName, p.lastName, String(getAge(p.dob)), p.gender, p.bloodType ?? '', p.phone, p.status, p.doctor?.name ?? '', p.admittedAt ? formatDate(p.admittedAt) : '']),
      ]);
    } else if (active === 'appointments') {
      exportToCSV('appointments', [
        ['Patient', 'MRN', 'Doctor', 'Department', 'Scheduled At', 'Duration', 'Type', 'Status'],
        ...appointments.map((a) => [
          a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : '',
          a.patient?.mrn ?? '', a.doctor?.name ?? '', a.department?.name ?? '',
          formatDateTime(a.scheduledAt), String(a.duration), a.type, a.status,
        ]),
      ]);
    } else {
      exportToCSV('occupancy', [
        ['Metric', 'Value'],
        ['Total Patients',       String(overview?.totalPatients     ?? 0)],
        ['Admitted Patients',    String(overview?.admittedPatients  ?? 0)],
        ['Critical Patients',    String(overview?.criticalPatients  ?? 0)],
        ['Total Beds',           String(overview?.totalBeds         ?? 0)],
        ['Occupied Beds',        String(overview?.occupiedBeds      ?? 0)],
        ['Occupancy Rate',       `${overview?.occupancyRate ?? 0}%`],
        ["Today's Appointments", String(overview?.todayAppointments ?? 0)],
        ['Active Alerts',        String(overview?.activeAlerts      ?? 0)],
      ]);
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px]">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Reports</h2>
            <p className="text-xs text-muted-foreground">Generate and export hospital data reports</p>
          </div>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm" className="gap-2 text-xs h-8">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </motion.div>

      {/* Overview KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {overviewLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[72px] rounded-2xl" />)
          : [
              { label: 'Total Patients',        value: overview?.totalPatients     ?? 0, icon: Users,     color: 'text-sky-500',     bg: 'bg-sky-500/10' },
              { label: "Today's Appointments",  value: overview?.todayAppointments ?? 0, icon: Calendar,  color: 'text-violet-500',  bg: 'bg-violet-500/10' },
              { label: 'Bed Occupancy',         value: `${overview?.occupancyRate ?? 0}%`, icon: BedDouble, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Active Alerts',         value: overview?.activeAlerts     ?? 0, icon: Activity,  color: 'text-amber-500',   bg: 'bg-amber-500/10' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                      <s.icon className={`w-4 h-4 ${s.color}`} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl font-black tabular-nums">{s.value}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{s.label}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
        }
      </div>

      {/* Report type tabs */}
      <div className="flex gap-2 p-1 bg-muted/40 rounded-xl w-fit border border-border">
        {REPORT_TABS.map(({ id, icon: Icon, title }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
              active === id
                ? 'gradient-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
            {title}
          </button>
        ))}
      </div>

      {/* Active report table */}
      <motion.div key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {active === 'patients' && (
          <Card>
            <CardHeader className="pb-0 px-6 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Patient Summary Report</CardTitle>
                  <CardDescription className="text-xs mt-0.5">{patients.length} patients</CardDescription>
                </div>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr] gap-4 px-6 py-3 bg-muted/30 border-y border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                <span>Patient</span><span>Age / Sex</span><span>Blood</span><span>Doctor</span><span>Status</span>
              </div>
              {patientsLoading ? (
                <TableSkeleton rows={6} cols={5} gridTemplateColumns="2fr 1fr 1fr 1.5fr 1fr" />
              ) : patients.length === 0 ? (
                <EmptyState icon={FileText} title="No patients found" />
              ) : (
                patients.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.015 }}
                    className={`grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr] gap-4 px-6 py-3.5 items-center border-b border-border/40 last:border-0 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/[0.015]'} hover:bg-muted/30`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.firstName} {p.lastName}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{p.mrn}</p>
                    </div>
                    <span className="text-sm">{getAge(p.dob)}y · {p.gender.charAt(0)}</span>
                    <span className="text-sm text-muted-foreground">{p.bloodType ?? '—'}</span>
                    <span className="text-sm text-muted-foreground truncate">{p.doctor?.name ?? '—'}</span>
                    <PatientStatusBadge status={p.status} />
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {active === 'appointments' && (
          <Card>
            <CardHeader className="pb-0 px-6 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Appointment Report</CardTitle>
                  <CardDescription className="text-xs mt-0.5">{appointments.length} appointments</CardDescription>
                </div>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr] gap-4 px-6 py-3 bg-muted/30 border-y border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                <span>Patient</span><span>Doctor</span><span>Scheduled</span><span>Type</span><span>Status</span>
              </div>
              {apptLoading ? (
                <TableSkeleton rows={6} cols={5} gridTemplateColumns="2fr 1.5fr 1.5fr 1fr 1fr" />
              ) : appointments.length === 0 ? (
                <EmptyState icon={FileText} title="No appointments found" />
              ) : (
                appointments.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.015 }}
                    className={`grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr] gap-4 px-6 py-3.5 items-center border-b border-border/40 last:border-0 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/[0.015]'} hover:bg-muted/30`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : '—'}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">{a.patient?.mrn}</p>
                    </div>
                    <span className="text-sm text-muted-foreground truncate">{a.doctor?.name ?? '—'}</span>
                    <span className="text-sm">{formatDateTime(a.scheduledAt)}</span>
                    <Badge variant="secondary" className="text-[10px] w-fit">{a.type.replace('_', ' ')}</Badge>
                    <AppointmentStatusBadge status={a.status} />
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {active === 'occupancy' && (
          <Card>
            <CardHeader className="pb-0 px-6 pt-5">
              <CardTitle className="text-sm font-semibold">Occupancy Report</CardTitle>
              <CardDescription className="text-xs mt-0.5">Current bed utilization metrics</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-2">
              {overviewLoading
                ? <div className="space-y-2.5">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-11 rounded-xl" />)}</div>
                : (
                  <div className="space-y-2">
                    {[
                      { label: 'Total Beds',              value: overview?.totalBeds         ?? 0, suffix: '',  accent: false },
                      { label: 'Occupied Beds',           value: overview?.occupiedBeds      ?? 0, suffix: '',  accent: false },
                      { label: 'Occupancy Rate',          value: overview?.occupancyRate     ?? 0, suffix: '%', accent: true },
                      { label: 'Total Patients (Active)', value: overview?.totalPatients     ?? 0, suffix: '',  accent: false },
                      { label: 'Admitted Patients',       value: overview?.admittedPatients  ?? 0, suffix: '',  accent: false },
                      { label: 'Critical Patients',       value: overview?.criticalPatients  ?? 0, suffix: '',  accent: false },
                      { label: "Today's Appointments",    value: overview?.todayAppointments ?? 0, suffix: '',  accent: false },
                      { label: 'Total Doctors',           value: overview?.totalDoctors      ?? 0, suffix: '',  accent: false },
                    ].map((row, i) => (
                      <motion.div
                        key={row.label}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between px-5 py-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/40"
                      >
                        <span className="text-sm font-medium text-foreground">{row.label}</span>
                        <span className={`text-xl font-black tabular-nums ${row.accent ? 'text-primary' : 'text-foreground'}`}>
                          {row.value}{row.suffix}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )
              }
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

// Redundant EmptyTable function removed in favor of shared EmptyState component
