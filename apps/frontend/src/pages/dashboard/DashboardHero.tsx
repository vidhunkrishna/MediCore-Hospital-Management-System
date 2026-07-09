import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { Skeleton } from '@/components/ui/skeleton';
import type { AIHealthScore } from '@/types';
import type { Alert } from '@/types';

function statusFromScore(score: number) {
  if (score >= 75) return { label: 'Stable',   color: 'text-emerald-400', dot: 'bg-emerald-400', ring: 'ring-emerald-500/20' };
  if (score >= 50) return { label: 'Moderate', color: 'text-amber-400',   dot: 'bg-amber-400',   ring: 'ring-amber-500/20' };
  return               { label: 'Critical',  color: 'text-red-400',     dot: 'bg-red-400',     ring: 'ring-red-500/20' };
}

interface Props {
  healthScore?: AIHealthScore;
  alerts?: Alert[];
  todayAppointments?: number;
  loading?: boolean;
  userName?: string;
}

export function DashboardHero({ healthScore, alerts, todayAppointments, loading, userName }: Props) {
  const navigate = useNavigate();
  const score  = healthScore?.score ?? 0;
  const status = statusFromScore(score);

  const bulletPoints = loading ? [] : [
    healthScore && healthScore.criticalPatients > 0
      ? `${healthScore.criticalPatients} patient${healthScore.criticalPatients > 1 ? 's' : ''} in critical condition`
      : 'No critical patients at this time',
    `${todayAppointments ?? 0} appointments scheduled today`,
    alerts && alerts.length > 0
      ? `${alerts.length} alert${alerts.length > 1 ? 's' : ''} require attention`
      : 'All alerts resolved',
    healthScore && healthScore.occupancyRate > 85
      ? `Bed occupancy elevated at ${healthScore.occupancyRate}%`
      : 'Bed capacity within normal range',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-accent/[0.04] pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/[0.04] rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">

          {/* Left: Identity + Score */}
          <div className="flex items-start gap-5 flex-1">
            {/* Score ring */}
            <div className={`relative flex-shrink-0 w-20 h-20 rounded-2xl bg-muted/50 border border-border flex flex-col items-center justify-center ring-4 ${status.ring}`}>
              {loading ? (
                <Skeleton className="w-12 h-12 rounded-xl" />
              ) : (
                <>
                  <span className={`text-2xl font-black tabular-nums ${status.color}`}>
                    <AnimatedCounter value={score} />
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">/100</span>
                </>
              )}
            </div>

            {/* Status text */}
            <div>
              <div className="text-xs text-muted-foreground font-medium mb-1">
                {loading ? <Skeleton className="h-3 w-24" /> : `Good ${greeting()}, ${userName?.split(' ')[0] ?? 'Doctor'}`}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight mb-2">
                {loading ? <Skeleton className="h-7 w-48" /> : 'Hospital Operations Center'}
              </h2>
              <div className="flex items-center gap-2">
                {loading ? (
                  <Skeleton className="h-5 w-20 rounded-full" />
                ) : (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-current/10 ${status.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot} status-dot-pulse`} />
                    {status.label}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">Health Score</span>
              </div>
            </div>
          </div>

          {/* Center: AI bullets */}
          <div className="lg:flex-1 lg:max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">AI Summary</span>
            </div>
            <ul className="space-y-1.5">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-3.5 w-full rounded" />)
                : bulletPoints.map((point, i) => {
                    const isAlert = point.includes('critical') || point.includes('alert') || point.includes('elevated');
                    return (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.07 }}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        {isAlert
                          ? <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                          : <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                        }
                        {point}
                      </motion.li>
                    );
                  })
              }
            </ul>
          </div>

          {/* Right: CTA actions */}
          <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/ai-command')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
            >
              <Brain className="w-4 h-4 flex-shrink-0" />
              AI Insights
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 text-sm font-medium text-foreground transition-colors"
            >
              <Activity className="w-4 h-4 flex-shrink-0" />
              Analytics
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
