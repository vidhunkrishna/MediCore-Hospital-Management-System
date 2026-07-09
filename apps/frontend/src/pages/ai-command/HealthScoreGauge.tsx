import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import type { AIHealthScore } from '@/types';

function scoreConfig(score: number) {
  if (score >= 75) return { stroke: '#10b981', strokeBg: '#10b98122', text: 'text-emerald-400', label: 'Healthy',  badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' };
  if (score >= 50) return { stroke: '#f59e0b', strokeBg: '#f59e0b22', text: 'text-amber-400',   label: 'Moderate', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25' };
  return               { stroke: '#ef4444', strokeBg: '#ef444422', text: 'text-red-400',     label: 'Critical', badge: 'bg-red-500/15 text-red-400 border-red-500/25' };
}

interface Props { data?: AIHealthScore; loading?: boolean; }

export function HealthScoreGauge({ data, loading }: Props) {
  const score = data?.score ?? 0;
  const cfg   = scoreConfig(score);

  const R  = 64;
  const cx = 80;
  const cy = 80;
  const circumference = Math.PI * R;
  const progress      = (score / 100) * circumference;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 flex flex-col items-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <Skeleton className="w-40 h-20 rounded-xl" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <div className="grid grid-cols-2 gap-3 w-full mt-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Label */}
            <p className="stat-label mb-4">Hospital Health Score</p>

            {/* SVG gauge */}
            <div className="relative">
              <svg width="160" height="88" viewBox="0 0 160 88" className="overflow-visible">
                {/* Track */}
                <path
                  d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
                  fill="none"
                  stroke={cfg.strokeBg}
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                {/* Score arc */}
                <motion.path
                  d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
                  fill="none"
                  stroke={cfg.stroke}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - progress }}
                  transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
                  filter={`drop-shadow(0 0 8px ${cfg.stroke}66)`}
                />
              </svg>
              {/* Value overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
                <span className={`text-4xl font-black tabular-nums ${cfg.text}`}>
                  <AnimatedCounter value={score} />
                </span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-widest">/ 100</span>
              </div>
            </div>

            {/* Status badge */}
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}
            >
              {cfg.label}
            </motion.span>

            {/* Sub-metrics grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-5 w-full">
              {[
                { label: 'Bed Occupancy',    value: data?.occupancyRate    ?? 0, suffix: '%' },
                { label: 'Staff Utilized',   value: data?.staffUtilization ?? 0, suffix: '%' },
                { label: 'Critical Pts',     value: data?.criticalPatients ?? 0, suffix: '' },
                { label: 'Open Alerts',      value: data?.unresolvedAlerts ?? 0, suffix: '' },
              ].map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.08 }}
                  className="bg-muted/40 rounded-xl p-3 text-center border border-border/50"
                >
                  <p className="text-base font-black tabular-nums text-foreground">
                    <AnimatedCounter value={m.value} suffix={m.suffix} />
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{m.label}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
