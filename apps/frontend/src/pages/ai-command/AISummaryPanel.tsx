import { motion } from 'framer-motion';
import { Brain, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import type { AIHealthScore } from '@/types';

function summaryText(data?: AIHealthScore): string {
  if (!data) return '';
  const lines: string[] = [];
  if (data.occupancyRate > 85) lines.push(`Bed occupancy is critically high at ${data.occupancyRate}% — immediate discharge planning recommended.`);
  else if (data.occupancyRate > 70) lines.push(`Bed occupancy is elevated at ${data.occupancyRate}%. Monitor ward capacity closely.`);
  else lines.push(`Bed occupancy is within normal range at ${data.occupancyRate}%.`);

  if (data.criticalPatients > 1) lines.push(`${data.criticalPatients} patients are in critical condition requiring priority attention.`);
  if (data.unresolvedAlerts > 3) lines.push(`${data.unresolvedAlerts} unresolved alerts are impacting the overall health score.`);
  else if (data.unresolvedAlerts > 0) lines.push(`${data.unresolvedAlerts} alert(s) pending resolution.`);

  if (data.staffUtilization > 80) lines.push('Staff utilization is high — consider scheduling additional support shifts.');
  else lines.push('Staffing levels are adequate for current patient volume.');

  const outlook = data.score >= 75 ? 'Overall hospital operations are running smoothly.' : data.score >= 50 ? 'Operations require attention in several areas.' : 'Multiple critical indicators need immediate intervention.';
  lines.push(outlook);
  return lines.join(' ');
}

interface Props { data?: AIHealthScore; loading?: boolean; }

export function AISummaryPanel({ data, loading }: Props) {
  const qc = useQueryClient();

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['ai'] });
    qc.invalidateQueries({ queryKey: ['analytics'] });
  };

  return (
    <Card className="border border-primary/20 bg-primary/[0.03]">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/25">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">AI Summary</p>
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={refresh} title="Refresh analysis">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
            {loading
              ? <div className="space-y-2"><Skeleton className="h-3.5 w-full" /><Skeleton className="h-3.5 w-4/5" /><Skeleton className="h-3.5 w-3/5" /></div>
              : (
                <motion.p
                  key={data?.score}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  {summaryText(data)}
                </motion.p>
              )
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
