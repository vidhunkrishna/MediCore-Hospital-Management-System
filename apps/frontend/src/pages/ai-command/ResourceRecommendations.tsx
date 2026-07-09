import { motion } from 'framer-motion';
import { BedDouble, Users, Activity, Zap, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { AIRecommendation } from '@/types';

const ICON_MAP: Record<string, React.ReactNode> = {
  bed:      <BedDouble className="w-4 h-4" />,
  users:    <Users className="w-4 h-4" />,
  activity: <Activity className="w-4 h-4" />,
  zap:      <Zap className="w-4 h-4" />,
};

const PRIORITY_STYLE: Record<string, { badge: 'destructive' | 'default' | 'warning' | 'secondary'; bar: string }> = {
  CRITICAL: { badge: 'destructive', bar: 'bg-red-500' },
  HIGH:     { badge: 'default',     bar: 'bg-indigo-500' },
  MEDIUM:   { badge: 'warning',     bar: 'bg-amber-500' },
  LOW:      { badge: 'secondary',   bar: 'bg-slate-500' },
};

interface Props { recommendations?: AIRecommendation[]; loading?: boolean; }

export function ResourceRecommendations({ recommendations, loading }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Resource Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          : recommendations?.map((rec, i) => {
              const style = PRIORITY_STYLE[rec.priority] ?? PRIORITY_STYLE.LOW;
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  className="flex gap-3 p-4 rounded-xl bg-secondary/30 border border-border hover:border-border/70 transition-all group"
                >
                  <div className={`w-1 rounded-full flex-shrink-0 ${style.bar}`} />
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 text-muted-foreground">
                    {ICON_MAP[rec.icon] ?? <Activity className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{rec.category}</span>
                      <Badge variant={style.badge} className="text-[10px]">{rec.priority}</Badge>
                    </div>
                    <p className="text-sm text-foreground leading-snug">{rec.message}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowRight className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs text-emerald-400 font-medium">{rec.impact}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
        }
      </CardContent>
    </Card>
  );
}
