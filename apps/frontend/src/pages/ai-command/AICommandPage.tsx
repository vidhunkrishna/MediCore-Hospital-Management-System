import { motion } from 'framer-motion';
import { Brain, Cpu } from 'lucide-react';
import { useHealthScore, useInsights, useForecast, useRecommendations } from '@/hooks/useAI';
import { useAlerts } from '@/hooks/useAnalytics';
import { HealthScoreGauge } from './HealthScoreGauge';
import { ForecastChart } from './ForecastChart';
import { InsightCards } from './InsightCards';
import { ResourceRecommendations } from './ResourceRecommendations';
import { CriticalAlertsPanel } from './CriticalAlertsPanel';
import { AISummaryPanel } from './AISummaryPanel';

export function AICommandPage() {
  const { data: healthScore, isLoading: healthLoading } = useHealthScore();
  const { data: insights, isLoading: insightsLoading } = useInsights();
  const { data: forecast, isLoading: forecastLoading } = useForecast();
  const { data: recommendations, isLoading: recsLoading } = useRecommendations();
  const { data: alerts, isLoading: alertsLoading } = useAlerts();

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">AI Command Center</h2>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Intelligent hospital operations analysis</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Cpu className="w-3.5 h-3.5" />
          Mock AI Engine v1.0
        </div>
      </motion.div>

      {/* AI Summary — full width */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <AISummaryPanel data={healthScore} loading={healthLoading} />
      </motion.div>

      {/* Health score + Forecast */}
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

      {/* Operational Insights — full width */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <InsightCards insights={insights} loading={insightsLoading} />
      </motion.div>
    </div>
  );
}
