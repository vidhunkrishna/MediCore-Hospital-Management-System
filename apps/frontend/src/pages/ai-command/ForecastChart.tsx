import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ForecastPoint } from '@/hooks/useAI';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2.5 border border-border shadow-xl text-xs space-y-1">
      <p className="font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}{p.name === 'Congestion' ? '%' : ''}</span></p>
      ))}
    </div>
  );
}

interface Props { data?: ForecastPoint[]; loading?: boolean; }

export function ForecastChart({ data, loading }: Props) {
  if (loading) return <Card className="p-6"><Skeleton className="h-48 w-full rounded-xl" /></Card>;

  const chartData = data?.filter((_, i) => i % 2 === 0).map((d) => ({
    hour: d.hour,
    Appointments: d.appointments,
    Congestion: d.congestion,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">24h Appointment Forecast</CardTitle>
        <CardDescription className="text-xs">Predicted appointment volume and congestion by hour</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="h-48"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="congGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 47% 13%)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: 'hsl(215 16% 47%)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215 16% 47%)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Appointments" stroke="#6366f1" strokeWidth={2} fill="url(#apptGrad)" dot={false} />
              <Area type="monotone" dataKey="Congestion" stroke="#f59e0b" strokeWidth={1.5} fill="url(#congGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
