import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertSeverityBadge } from '@/components/shared/StatusBadge';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import type { Alert } from '@/types';

const severityDot: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-slate-400',
};

export function AlertsPanel({ alerts, loading }: { alerts?: Alert[]; loading?: boolean }) {
  const qc = useQueryClient();

  const resolve = async (id: string) => {
    await api.patch(`/analytics/alerts/${id}/resolve`);
    qc.invalidateQueries({ queryKey: ['analytics', 'alerts'] });
    qc.invalidateQueries({ queryKey: ['analytics', 'overview'] });
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold">Active Alerts</CardTitle>
          {!!alerts?.length && (
            <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold">
              {alerts.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto max-h-72 space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)
        ) : !alerts?.length ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <p className="text-sm text-muted-foreground">No active alerts</p>
          </motion.div>
        ) : (
          alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border hover:border-border/70 transition-colors group"
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityDot[alert.severity] ?? 'bg-slate-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <AlertSeverityBadge severity={alert.severity} />
                  <span className="text-[10px] text-muted-foreground">{alert.type.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-foreground line-clamp-2">{alert.message}</p>
              </div>
              <button
                onClick={() => resolve(alert.id)}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Resolve"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
