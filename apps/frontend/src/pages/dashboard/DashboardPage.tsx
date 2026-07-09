import { Users, Calendar, BedDouble, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOverview, useAlerts, useDepartmentLoad, useRecentPatients } from '@/hooks/useAnalytics';
import { KPICard } from './KPICard';
import { ActivityFeed } from './ActivityFeed';
import { DepartmentChart } from './DepartmentChart';
import { RecentPatients } from './RecentPatients';
import { QuickActions } from './QuickActions';
import { AlertsPanel } from './AlertsPanel';
import { useAuthStore } from '@/store/auth.store';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: overview, isLoading: overviewLoading } = useOverview();
  const { data: alerts, isLoading: alertsLoading } = useAlerts();
  const { data: deptData, isLoading: deptLoading } = useDepartmentLoad();
  const { data: patients, isLoading: patientsLoading } = useRecentPatients();

  const kpis = [
    {
      title: 'Total Patients',
      value: overview?.totalPatients ?? 0,
      icon: Users,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      trend: 8,
      trendLabel: 'vs last week',
    },
    {
      title: "Today's Appointments",
      value: overview?.todayAppointments ?? 0,
      icon: Calendar,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      trend: 12,
      trendLabel: 'vs yesterday',
    },
    {
      title: 'Bed Occupancy',
      value: overview?.occupancyRate ?? 0,
      suffix: '%',
      icon: BedDouble,
      color: overview && overview.occupancyRate > 85 ? 'text-red-400' : 'text-emerald-400',
      bgColor: overview && overview.occupancyRate > 85 ? 'bg-red-500/10' : 'bg-emerald-500/10',
      trend: overview && overview.occupancyRate > 85 ? -3 : 2,
      trendLabel: 'capacity',
    },
    {
      title: 'Active Alerts',
      value: overview?.activeAlerts ?? 0,
      icon: AlertTriangle,
      color: overview && overview.activeAlerts > 3 ? 'text-red-400' : 'text-amber-400',
      bgColor: overview && overview.activeAlerts > 3 ? 'bg-red-500/10' : 'bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-semibold">
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here's what's happening at your hospital today.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <QuickActions />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} loading={overviewLoading} index={i} />
        ))}
      </div>

      {/* Charts + Activity Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <DepartmentChart data={deptData} loading={deptLoading} />
        </div>
        <ActivityFeed loading={false} />
      </div>

      {/* Recent Patients + Alerts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <RecentPatients patients={patients} loading={patientsLoading} />
        </div>
        <AlertsPanel alerts={alerts} loading={alertsLoading} />
      </div>
    </div>
  );
}
