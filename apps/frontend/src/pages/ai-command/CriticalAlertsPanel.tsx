import { motion } from 'framer-motion';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertSeverityBadge } from '@/components/shared/StatusBadge';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import type { Alert } from '@/types';

const SEV_DOT: Record<string, string> = {
  CRITICAL: 'bg-red-500 animate-pulse',
  HIGH:     'bg-orange-500',
  MEDIUM:   'bg-amber-400',
  LOW:      'bg-slate-400',
};

interface Props { alerts?: Alert[]; loading?: boolean; }

export function CriticalAlertsPanel({ alerts, loading }: Props) {
  const qc = useQueryClient();

  const resolve = async (id: string) => {
    await api.patch(`/analytics/alerts/${id}/resolve`);
    qc.invalidateQueries({ queryKey: ['analytics', 'alerts'] });
    qc.invalidateQueries({ queryKey: ['analytics', 'overview'] });
    qc.invalidateQueries({ queryKey: ['ai', 'health-score'] });
  };

  const critical = alerts?.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH') ?? [];
  const others   = alerts?.filter((a) => a.severity === 'MEDIUM' || a.severity === 'LOW') ?? [];
  const displayed = [...critical, ...others];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Critical Alerts</CardTitle>
          {!!alerts?.length && (
            <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              {alerts.length} active
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
          : displayed.length === 0
          ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <p className="text-sm text-muted-foreground">All clear — no active alerts</p>
            </motion.div>
          )
          : displayed.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border group hover:border-border/70 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${SEV_DOT[alert.severity] ?? 'bg-slate-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <AlertSeverityBadge severity={alert.severity} />
                  <span className="text-[10px] text-muted-foreground">{alert.type.replace(/_/g, ' ')}</span>
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
        }
      </CardContent>
    </Card>
  );
}
