import { motion } from 'framer-motion';
import { Download, TrendingUp, Users, BedDouble, Calendar } from 'lucide-react';
import { useOverview, useOccupancyTrend, useAppointmentVolume, useDepartmentLoad } from '@/hooks/useAnalytics';
import { OccupancyChart } from './OccupancyChart';
import { AppointmentVolumeChart } from './AppointmentVolumeChart';
import { DemographicsChart } from './DemographicsChart';
import { DepartmentRadarChart } from './DepartmentRadarChart';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const KPI_CONFIG = [
  { key: 'totalPatients', label: 'Total Patients', icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10', suffix: '' },
  { key: 'occupancyRate', label: 'Bed Occupancy', icon: BedDouble, color: 'text-emerald-400', bg: 'bg-emerald-500/10', suffix: '%' },
  { key: 'todayAppointments', label: "Today's Appointments", icon: Calendar, color: 'text-cyan-400', bg: 'bg-cyan-500/10', suffix: '' },
  { key: 'activeAlerts', label: 'Active Alerts', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', suffix: '' },
];

function exportCSV(occupancy: { date: string; occupancy: number; admissions: number; discharges: number }[]) {
  const rows = [
    ['Date', 'Occupancy %', 'Admissions', 'Discharges'],
    ...occupancy.map((d) => [d.date, d.occupancy, d.admissions, d.discharges]),
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `occupancy-trend-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useOverview();
  const { data: occupancy, isLoading: occupancyLoading } = useOccupancyTrend();
  const { data: appointmentVolume, isLoading: apptLoading } = useAppointmentVolume();
  const { data: deptLoad, isLoading: deptLoading } = useDepartmentLoad();

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-semibold">Analytics</h2>
          <p className="text-sm text-muted-foreground">Hospital performance insights and trends</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={!occupancy?.length}
          onClick={() => occupancy && exportCSV(occupancy)}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </motion.div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CONFIG.map(({ key, label, icon: Icon, color, bg, suffix }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
          >
            <Card className="p-5 glass-hover">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
              {overviewLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold tabular-nums">
                  <AnimatedCounter value={((overview as unknown as Record<string, number>)?.[key]) ?? 0} suffix={suffix} />
                </p>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <OccupancyChart data={occupancy} loading={occupancyLoading} />
        <AppointmentVolumeChart data={appointmentVolume} loading={apptLoading} />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DemographicsChart overview={overview} loading={overviewLoading} />
        <DepartmentRadarChart data={deptLoad} loading={deptLoading} />
      </div>
    </div>
  );
}
