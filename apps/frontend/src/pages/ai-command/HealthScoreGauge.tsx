import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import type { AIHealthScore } from '@/types';

function scoreColor(score: number) {
  if (score >= 75) return { stroke: '#10b981', text: 'text-emerald-400', label: 'Healthy', bg: 'bg-emerald-500/10' };
  if (score >= 50) return { stroke: '#f59e0b', text: 'text-amber-400', label: 'Moderate', bg: 'bg-amber-500/10' };
  return { stroke: '#ef4444', text: 'text-red-400', label: 'Critical', bg: 'bg-red-500/10' };
}

interface Props { data?: AIHealthScore; loading?: boolean; }

export function HealthScoreGauge({ data, loading }: Props) {
  const score = data?.score ?? 0;
  const { stroke, text, label, bg } = scoreColor(score);

  // SVG arc parameters
  const r = 70;
  const cx = 90;
  const cy = 90;
  const circumference = Math.PI * r; // half circle
  const progress = (score / 100) * circumference;

  return (
    <Card className="flex flex-col items-center justify-center p-6">
      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-44 h-24 rounded-xl" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-muted-foreground mb-4">Hospital Health Score</p>
          <div className="relative">
            <svg width="180" height="100" viewBox="0 0 180 100">
              {/* Background arc */}
              <path
                d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none"
                stroke="hsl(222 47% 13%)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Score arc */}
              <motion.path
                d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none"
                stroke={stroke}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - progress }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <span className={`text-4xl font-bold tabular-nums ${text}`}>
                <AnimatedCounter value={score} />
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`mt-3 px-4 py-1.5 rounded-full text-sm font-semibold ${bg} ${text}`}
          >
            {label}
          </motion.div>

          {/* Sub-metrics */}
          <div className="grid grid-cols-2 gap-3 mt-5 w-full">
            {[
              { label: 'Bed Occupancy', value: data?.occupancyRate ?? 0, suffix: '%' },
              { label: 'Staff Utilization', value: data?.staffUtilization ?? 0, suffix: '%' },
              { label: 'Critical Patients', value: data?.criticalPatients ?? 0, suffix: '' },
              { label: 'Open Alerts', value: data?.unresolvedAlerts ?? 0, suffix: '' },
            ].map((m) => (
              <div key={m.label} className="bg-secondary/40 rounded-xl p-3 text-center">
                <p className="text-lg font-bold tabular-nums">
                  <AnimatedCounter value={m.value} suffix={m.suffix} />
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
