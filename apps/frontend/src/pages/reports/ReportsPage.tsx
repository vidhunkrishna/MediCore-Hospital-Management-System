import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Users, Calendar, BedDouble, Activity } from 'lucide-react';
import { useOverview } from '@/hooks/useAnalytics';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PatientStatusBadge, AppointmentStatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatDateTime, getAge } from '@/lib/utils';

type ReportType = 'patients' | 'appointments' | 'occupancy';

const REPORT_CARDS = [
  { id: 'patients'     as ReportType, icon: Users,    title: 'Patient Summary',    description: 'Full patient roster with status and demographics', color: 'text-primary',                    bg: 'bg-primary/10' },
  { id: 'appointments' as ReportType, icon: Calendar, title: 'Appointment Report', description: 'All scheduled and completed appointments',          color: 'text-cyan-600 dark:text-cyan-400',    bg: 'bg-cyan-500/10' },
  { id: 'occupancy'    as ReportType, icon: BedDouble, title: 'Occupancy Report',  description: 'Bed utilization and capacity metrics',              color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
] as const;

function exportToCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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
          a.patient?.mrn ?? '',
          a.doctor?.name ?? '',
          a.department?.name ?? '',
          formatDateTime(a.scheduledAt),
          String(a.duration),
          a.type,
          a.status,
        ]),
      ]);
    } else {
      exportToCSV('occupancy', [
        ['Metric', 'Value'],
        ['Total Patients',        String(overview?.totalPatients     ?? 0)],
        ['Admitted Patients',     String(overview?.admittedPatients  ?? 0)],
        ['Critical Patients',     String(overview?.criticalPatients  ?? 0)],
        ['Total Beds',            String(overview?.totalBeds         ?? 0)],
        ['Occupied Beds',         String(overview?.occupiedBeds      ?? 0)],
        ['Occupancy Rate',        `${overview?.occupancyRate ?? 0}%`],
        ["Today's Appointments",  String(overview?.todayAppointments ?? 0)],
        ['Active Alerts',         String(overview?.activeAlerts      ?? 0)],
      ]);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Reports</h2>
          <p className="text-sm text-muted-foreground">Generate and export hospital data reports</p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </motion.div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {overviewLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
          : [
              { label: 'Total Patients',        value: overview?.totalPatients ?? 0,     icon: Users },
              { label: "Today's Appointments",  value: overview?.todayAppointments ?? 0, icon: Calendar },
              { label: 'Bed Occupancy',         value: `${overview?.occupancyRate ?? 0}%`, icon: BedDouble },
              { label: 'Active Alerts',         value: overview?.activeAlerts ?? 0,      icon: Activity },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </Card>
              </motion.div>
            ))
        }
      </div>

      {/* Report selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {REPORT_CARDS.map(({ id, icon: Icon, title, description, color, bg }) => (
          <motion.button
            key={id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActive(id)}
            className={`text-left p-4 rounded-2xl border transition-all duration-200 bg-card ${
              active === id
                ? 'border-primary/50 shadow-lg shadow-primary/10'
                : 'border-border hover:border-border/70'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            {active === id && (
              <div className="flex items-center gap-1 mt-2">
                <FileText className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">Selected</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Report table */}
      <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {active === 'patients' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Patient Summary Report</CardTitle>
              <CardDescription className="text-xs">{patients.length} patients</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-2.5 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <span>Patient</span><span>Age / Gender</span><span>Blood</span><span>Doctor</span><span>Status</span>
              </div>
              {patientsLoading
                ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 mx-5 my-2 rounded-xl" />)
                : patients.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-10">No patients found</p>
                : patients.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 items-center border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.mrn}</p>
                    </div>
                    <span className="text-sm">{getAge(p.dob)}y · {p.gender.charAt(0)}</span>
                    <span className="text-sm text-muted-foreground">{p.bloodType ?? '—'}</span>
                    <span className="text-sm text-muted-foreground truncate">{p.doctor?.name ?? '—'}</span>
                    <PatientStatusBadge status={p.status} />
                  </motion.div>
                ))
              }
            </CardContent>
          </Card>
        )}

        {active === 'appointments' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Appointment Report</CardTitle>
              <CardDescription className="text-xs">{appointments.length} appointments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr] gap-4 px-5 py-2.5 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <span>Patient</span><span>Doctor</span><span>Scheduled</span><span>Type</span><span>Status</span>
              </div>
              {apptLoading
                ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 mx-5 my-2 rounded-xl" />)
                : appointments.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-10">No appointments found</p>
                : appointments.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 items-center border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : '—'}</p>
                      <p className="text-xs text-muted-foreground font-mono">{a.patient?.mrn}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{a.doctor?.name ?? '—'}</span>
                    <span className="text-sm">{formatDateTime(a.scheduledAt)}</span>
                    <Badge variant="secondary" className="text-[10px] w-fit">{a.type.replace('_', ' ')}</Badge>
                    <AppointmentStatusBadge status={a.status} />
                  </motion.div>
                ))
              }
            </CardContent>
          </Card>
        )}

        {active === 'occupancy' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Occupancy Report</CardTitle>
              <CardDescription className="text-xs">Current bed utilization metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {overviewLoading
                ? <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
                : (
                  <div className="space-y-3">
                    {[
                      { label: 'Total Beds',               value: overview?.totalBeds         ?? 0, suffix: '' },
                      { label: 'Occupied Beds',            value: overview?.occupiedBeds      ?? 0, suffix: '' },
                      { label: 'Occupancy Rate',           value: overview?.occupancyRate     ?? 0, suffix: '%' },
                      { label: 'Total Patients (Active)',  value: overview?.totalPatients     ?? 0, suffix: '' },
                      { label: 'Admitted Patients',        value: overview?.admittedPatients  ?? 0, suffix: '' },
                      { label: 'Critical Patients',        value: overview?.criticalPatients  ?? 0, suffix: '' },
                      { label: "Today's Appointments",     value: overview?.todayAppointments ?? 0, suffix: '' },
                      { label: 'Total Doctors',            value: overview?.totalDoctors      ?? 0, suffix: '' },
                    ].map((row, i) => (
                      <motion.div key={row.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/40">
                        <span className="text-sm font-medium">{row.label}</span>
                        <span className="text-2xl font-bold tabular-nums">{row.value}{row.suffix}</span>
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
