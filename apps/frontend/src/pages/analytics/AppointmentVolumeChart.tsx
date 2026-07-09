import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useChartTheme } from '@/hooks/useChartTheme';
import type { AppointmentVolumeResponse } from '@/hooks/useAnalytics';

const DEPT_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 border border-border bg-card text-card-foreground shadow-xl text-xs space-y-1">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
}

interface Props { data?: AppointmentVolumeResponse; loading?: boolean; }

export function AppointmentVolumeChart({ data, loading }: Props) {
  const { grid, text } = useChartTheme();
  if (loading) return <Card className="p-6"><Skeleton className="h-72 w-full rounded-xl" /></Card>;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Weekly Appointment Volume</CardTitle>
        <CardDescription className="text-xs">Appointments per department by day of week</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={1}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey="day" tick={{ fill: text, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: text, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: text }} />
              {data?.departments.map((dept, i) => (
                <Bar key={dept} dataKey={dept} stackId="a" fill={DEPT_COLORS[i % DEPT_COLORS.length]}
                  radius={i === (data.departments.length - 1) ? [3, 3, 0, 0] : [0, 0, 0, 0]} maxBarSize={28} fillOpacity={0.85} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
