import { Users, Calendar, BedDouble, AlertTriangle } from 'lucide-react';
import { useOverview, useAlerts, useDepartmentLoad, useRecentPatients } from '@/hooks/useAnalytics';
import { useHealthScore } from '@/hooks/useAI';
import { KPICard } from './KPICard';
import { ActivityFeed } from './ActivityFeed';
import { DepartmentChart } from './DepartmentChart';
import { RecentPatients } from './RecentPatients';
import { QuickActions } from './QuickActions';
import { AlertsPanel } from './AlertsPanel';
import { DashboardHero } from './DashboardHero';
import { useAuthStore } from '@/store/auth.store';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: overview,  isLoading: overviewLoading } = useOverview();
  const { data: alerts,    isLoading: alertsLoading }   = useAlerts();
  const { data: deptData,  isLoading: deptLoading }     = useDepartmentLoad();
  const { data: patients,  isLoading: patientsLoading } = useRecentPatients();
  const { data: healthScore, isLoading: healthLoading } = useHealthScore();

  const kpis = [
    {
      title: 'Total Patients',
      value: overview?.totalPatients ?? 0,
      icon: Users,
      color: 'text-sky-500',
      bgColor: 'bg-sky-500/10',
      trend: 8,
      trendLabel: 'vs last week',
    },
    {
      title: "Today's Appointments",
      value: overview?.todayAppointments ?? 0,
      icon: Calendar,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
      trend: 12,
      trendLabel: 'vs yesterday',
    },
    {
      title: 'Bed Occupancy',
      value: overview?.occupancyRate ?? 0,
      suffix: '%',
      icon: BedDouble,
      color: overview && overview.occupancyRate > 85 ? 'text-red-500' : 'text-emerald-500',
      bgColor: overview && overview.occupancyRate > 85 ? 'bg-red-500/10' : 'bg-emerald-500/10',
      trend: overview && overview.occupancyRate > 85 ? -3 : 2,
      trendLabel: 'capacity',
    },
    {
      title: 'Active Alerts',
      value: overview?.activeAlerts ?? 0,
      icon: AlertTriangle,
      color: overview && overview.activeAlerts > 3 ? 'text-red-500' : 'text-amber-500',
      bgColor: overview && overview.activeAlerts > 3 ? 'bg-red-500/10' : 'bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-5 max-w-[1440px]">
      {/* Hero — full width, visual anchor */}
      <DashboardHero
        healthScore={healthScore}
        alerts={alerts}
        todayAppointments={overview?.todayAppointments}
        loading={healthLoading || overviewLoading}
        userName={user?.name}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* KPI Cards — subordinate to hero */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} loading={overviewLoading} index={i} />
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <DepartmentChart data={deptData} loading={deptLoading} />
        </div>
        <ActivityFeed loading={false} />
      </div>

      {/* Recent Patients + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <RecentPatients patients={patients} loading={patientsLoading} />
        </div>
        <AlertsPanel alerts={alerts} loading={alertsLoading} />
      </div>
    </div>
  );
}
