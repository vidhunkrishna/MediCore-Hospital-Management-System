import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useChartTheme } from '@/hooks/useChartTheme';
import type { AnalyticsOverview } from '@/types';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-2.5 border border-border bg-card text-card-foreground shadow-xl text-xs">
      <p style={{ color: payload[0].payload.color }} className="font-semibold">
        {payload[0].name}: {payload[0].value}
      </p>
    </div>
  );
}

interface Props { overview?: AnalyticsOverview; loading?: boolean; }

export function DemographicsChart({ overview, loading }: Props) {
  const { text } = useChartTheme();
  if (loading) return <Card className="p-6"><Skeleton className="h-64 w-full rounded-xl" /></Card>;

  const data = [
    { name: 'Admitted',   value: overview?.admittedPatients ?? 0,  color: COLORS[0] },
    { name: 'Outpatient', value: (overview?.totalPatients ?? 0) - (overview?.admittedPatients ?? 0) - (overview?.criticalPatients ?? 0), color: COLORS[1] },
    { name: 'Critical',   value: overview?.criticalPatients ?? 0,  color: COLORS[2] },
    { name: 'Doctors',    value: overview?.totalDoctors ?? 0,      color: COLORS[3] },
  ].filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Patient Distribution</CardTitle>
        <CardDescription className="text-xs">Current patient status breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25, duration: 0.4 }} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {data.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: text }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
