import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AIHealthScore, AIInsight, AIRecommendation } from '@/types';

interface ForecastPoint {
  hour: string;
  appointments: number;
  congestion: number;
}

export function useHealthScore() {
  return useQuery({
    queryKey: ['ai', 'health-score'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: AIHealthScore }>('/ai/health-score');
      return res.data.data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useInsights() {
  return useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: AIInsight[] }>('/ai/insights');
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export function useForecast() {
  return useQuery({
    queryKey: ['ai', 'forecast'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: ForecastPoint[] }>('/ai/forecast');
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ['ai', 'recommendations'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: AIRecommendation[] }>('/ai/recommendations');
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export type { ForecastPoint };
