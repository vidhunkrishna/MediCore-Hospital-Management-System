import { motion } from 'framer-motion';
import { Brain, Cpu, Activity } from 'lucide-react';
import { useHealthScore, useInsights, useForecast, useRecommendations } from '@/hooks/useAI';
import { useAlerts } from '@/hooks/useAnalytics';
import { HealthScoreGauge } from './HealthScoreGauge';
import { ForecastChart } from './ForecastChart';
import { InsightCards } from './InsightCards';
import { ResourceRecommendations } from './ResourceRecommendations';
import { CriticalAlertsPanel } from './CriticalAlertsPanel';
import { AISummaryPanel } from './AISummaryPanel';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Activity className="w-3 h-3 text-primary" />
      <span className="font-semibold text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  );
}

export function AICommandPage() {
  const { data: healthScore,     isLoading: healthLoading  } = useHealthScore();
  const { data: insights,        isLoading: insightsLoading } = useInsights();
  const { data: forecast,        isLoading: forecastLoading } = useForecast();
  const { data: recommendations, isLoading: recsLoading    } = useRecommendations();
  const { data: alerts,          isLoading: alertsLoading  } = useAlerts();

  return (
    <div className="space-y-5 max-w-[1440px]">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">AI Command Center</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Intelligent hospital operations analysis and predictions</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Stat label="health score" value={healthScore?.score ?? '—'} />
          <Stat label="active alerts" value={alerts?.length ?? '—'} />
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <Cpu className="w-3 h-3" />
            <span>{healthScore?.engine ?? 'AI Engine'}</span>
          </div>
        </div>
      </motion.div>

      {/* AI Summary — full width accent card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <AISummaryPanel data={healthScore} loading={healthLoading} />
      </motion.div>

      {/* Health Score + Forecast — primary visual row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <HealthScoreGauge data={healthScore} loading={healthLoading} />
        </motion.div>
        <motion.div className="xl:col-span-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <ForecastChart data={forecast} loading={forecastLoading} />
        </motion.div>
      </div>

      {/* Alerts + Recommendations */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <CriticalAlertsPanel alerts={alerts} loading={alertsLoading} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <ResourceRecommendations recommendations={recommendations} loading={recsLoading} />
        </motion.div>
      </div>

      {/* Insights — full width */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <InsightCards insights={insights} loading={insightsLoading} />
      </motion.div>
    </div>
  );
}
