import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useChartTheme } from '@/hooks/useChartTheme';
import type { DeptLoad } from '@/hooks/useAnalytics';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 border border-border bg-card text-card-foreground shadow-xl text-xs">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-muted-foreground">Patients: <span className="text-foreground font-medium">{payload[0]?.value}</span></p>
      <p className="text-muted-foreground">Load: <span className="text-foreground font-medium">{payload[1]?.value}%</span></p>
    </div>
  );
}

export function DepartmentChart({ data, loading }: { data?: DeptLoad[]; loading?: boolean }) {
  const { grid, text } = useChartTheme();
  if (loading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Department Load</CardTitle>
        <CardDescription className="text-xs">Patient count and capacity utilization</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey="department" tick={{ fill: text, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: string) => v.slice(0, 5)} />
              <YAxis tick={{ fill: text, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
              <Bar dataKey="patients" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {data?.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />)}
              </Bar>
              <Bar dataKey="load" radius={[4, 4, 0, 0]} fill="hsl(var(--secondary))" maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
