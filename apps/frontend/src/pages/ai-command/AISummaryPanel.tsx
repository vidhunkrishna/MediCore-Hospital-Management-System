import { motion } from 'framer-motion';
import { Brain, RefreshCw, Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import type { AIHealthScore } from '@/types';

function summaryLines(data?: AIHealthScore): { text: string; warn: boolean }[] {
  if (!data) return [];
  const lines: { text: string; warn: boolean }[] = [];

  if (data.occupancyRate > 85)       lines.push({ text: `Bed occupancy critically high at ${data.occupancyRate}% — discharge planning recommended.`, warn: true });
  else if (data.occupancyRate > 70)  lines.push({ text: `Bed occupancy elevated at ${data.occupancyRate}%. Monitor ward capacity.`, warn: true });
  else                               lines.push({ text: `Bed occupancy normal at ${data.occupancyRate}%.`, warn: false });

  if (data.criticalPatients > 1)     lines.push({ text: `${data.criticalPatients} patients in critical condition — priority attention required.`, warn: true });
  if (data.unresolvedAlerts > 3)     lines.push({ text: `${data.unresolvedAlerts} unresolved alerts impacting health score.`, warn: true });
  else if (data.unresolvedAlerts > 0)lines.push({ text: `${data.unresolvedAlerts} alert(s) pending resolution.`, warn: false });

  lines.push({
    text: data.staffUtilization > 80
      ? 'Staff utilization high — consider additional support shifts.'
      : 'Staffing levels adequate for current patient volume.',
    warn: data.staffUtilization > 80,
  });

  lines.push({
    text: data.score >= 75
      ? 'Overall operations are running smoothly.'
      : data.score >= 50
      ? 'Operations require attention in several areas.'
      : 'Multiple critical indicators need immediate intervention.',
    warn: data.score < 50,
  });
  return lines;
}

interface Props { data?: AIHealthScore; loading?: boolean; }

export function AISummaryPanel({ data, loading }: Props) {
  const qc = useQueryClient();

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['ai'] });
    qc.invalidateQueries({ queryKey: ['analytics'] });
  };

  const lines = summaryLines(data);

  return (
    <Card className="overflow-hidden border border-primary/20">
      {/* Gradient header strip */}
      <div className="gradient-primary h-0.5 w-full" />
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
            <Brain className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">AI Operations Summary</p>
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot-pulse" />
                  LIVE
                </span>
              </div>
              <button
                onClick={refresh}
                aria-label="Refresh AI analysis"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
                <Skeleton className="h-3.5 w-4/6" />
              </div>
            ) : (
              <motion.div
                key={data?.score}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-wrap gap-x-4 gap-y-1.5"
              >
                {lines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                    className="flex items-start gap-1.5 text-xs text-muted-foreground min-w-0"
                  >
                    {line.warn
                      ? <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                      : <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                    }
                    <span>{line.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
