import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useChartTheme } from '@/hooks/useChartTheme';
import type { DeptLoad } from '@/hooks/useAnalytics';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 border border-border bg-card text-card-foreground shadow-xl text-xs space-y-1">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-muted-foreground">{p.name}: <span className="text-foreground font-medium">{p.value}</span></p>
      ))}
    </div>
  );
}

interface Props { data?: DeptLoad[]; loading?: boolean; }

export function DepartmentRadarChart({ data, loading }: Props) {
  const { grid, text } = useChartTheme();
  if (loading) return <Card className="p-6"><Skeleton className="h-64 w-full rounded-xl" /></Card>;

  const radarData = data?.map((d) => ({
    department: d.department.slice(0, 6),
    Patients: d.patients,
    Staff: d.staff,
    Load: Math.round(d.load / 10),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Department Comparison</CardTitle>
        <CardDescription className="text-xs">Patients, staff and load by department</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.4 }} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 4, right: 24, bottom: 4, left: 24 }}>
              <PolarGrid stroke={grid} />
              <PolarAngleAxis dataKey="department" tick={{ fill: text, fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fill: text, fontSize: 9 }} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: text }} />
              <Radar name="Patients" dataKey="Patients" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={1.5} />
              <Radar name="Staff"    dataKey="Staff"    stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={1.5} />
              <Radar name="Load"     dataKey="Load"     stroke="#10b981" fill="#10b981" fillOpacity={0.1}  strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
