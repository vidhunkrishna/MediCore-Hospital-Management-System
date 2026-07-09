import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
  index?: number;
}

export function KPICard({ title, value, suffix, icon: Icon, color, bgColor, trend, trendLabel, loading, index = 0 }: KPICardProps) {
  if (loading) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-3 w-24" />
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <Card className="p-6 glass-hover cursor-default group relative overflow-hidden">
        {/* Subtle glow on hover */}
        <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl', bgColor)} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bgColor)}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
          </div>

          <div className="mb-2">
            <span className="text-3xl font-bold tabular-nums tracking-tight">
              <AnimatedCounter value={value} suffix={suffix} />
            </span>
          </div>

          {trend !== undefined && (
            <div className="flex items-center gap-1">
              {trend >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              )}
              <span className={cn('text-xs font-medium', trend >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
