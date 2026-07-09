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
      <Card className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
    >
      <Card className="p-5 overflow-hidden relative group cursor-default border border-border hover:border-border/70 transition-all duration-200 hover:shadow-lg hover:shadow-black/10">
        {/* Icon accent strip */}
        <div className={cn('absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-1/2 translate-x-1/2', bgColor)} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground leading-none">{title}</p>
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', bgColor)}>
              <Icon className={cn('w-4 h-4', color)} strokeWidth={1.75} />
            </div>
          </div>

          <div className="mb-1.5">
            <span className="text-2xl font-black tabular-nums tracking-tight text-foreground">
              <AnimatedCounter value={value} suffix={suffix} />
            </span>
          </div>

          {trend !== undefined ? (
            <div className="flex items-center gap-1">
              {trend >= 0
                ? <TrendingUp className="w-3 h-3 text-emerald-500" />
                : <TrendingDown className="w-3 h-3 text-red-500" />
              }
              <span className={cn('text-[11px] font-semibold', trend >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-[11px] text-muted-foreground">{trendLabel}</span>}
            </div>
          ) : (
            <div className="h-4" />
          )}
        </div>
      </Card>
    </motion.div>
  );
}
