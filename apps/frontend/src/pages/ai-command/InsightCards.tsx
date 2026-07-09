import { motion } from 'framer-motion';
import { TrendingUp, Cpu, Users, Zap, AlertOctagon, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { AIInsight } from '@/types';

const TYPE_ICON: Record<string, React.ReactNode> = {
  optimization: <Zap className="w-4 h-4" />,
  forecast:     <TrendingUp className="w-4 h-4" />,
  resource:     <Cpu className="w-4 h-4" />,
  efficiency:   <TrendingUp className="w-4 h-4" />,
  staffing:     <Users className="w-4 h-4" />,
};

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'default' | 'secondary'> = {
  CRITICAL: 'destructive',
  HIGH:     'default',
  MEDIUM:   'warning',
  LOW:      'secondary',
};

const PRIORITY_BORDER: Record<string, string> = {
  CRITICAL: 'border-destructive/30 hover:border-destructive/50',
  HIGH:     'border-primary/30 hover:border-primary/50',
  MEDIUM:   'border-amber-500/30 hover:border-amber-500/50',
  LOW:      'border-border hover:border-border/70',
};

interface Props { insights?: AIInsight[]; loading?: boolean; }

export function InsightCards({ insights, loading }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Operational Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
          : insights?.map((insight, i) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className={`p-4 rounded-xl border bg-muted/20 transition-all duration-200 group cursor-default ${PRIORITY_BORDER[insight.priority] ?? 'border-border'}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
                  {TYPE_ICON[insight.type] ?? <AlertOctagon className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold">{insight.title}</p>
                    <Badge variant={PRIORITY_VARIANT[insight.priority] ?? 'secondary'} className="text-[10px]">
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.message}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-primary font-medium">
                    <ArrowRight className="w-3 h-3" />
                    {insight.action}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        }
      </CardContent>
    </Card>
  );
}
