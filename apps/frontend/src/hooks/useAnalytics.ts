import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AnalyticsOverview, Alert, Patient } from '@/types';

export function useOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: AnalyticsOverview }>('/analytics/overview');
      return res.data.data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ['analytics', 'alerts'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: Alert[] }>('/analytics/alerts');
      return res.data.data;
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useDepartmentLoad() {
  return useQuery({
    queryKey: ['analytics', 'departments'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: DeptLoad[] }>('/analytics/departments');
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export interface DeptLoad {
  department: string;
  patients: number;
  staff: number;
  appointments: number;
  load: number;
}

export function useRecentPatients() {
  return useQuery({
    queryKey: ['patients', 'recent'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: Patient[] }>('/patients?limit=6&page=1');
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export interface OccupancyPoint {
  date: string;
  occupancy: number;
  admissions: number;
  discharges: number;
}

export function useOccupancyTrend() {
  return useQuery({
    queryKey: ['analytics', 'occupancy'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: OccupancyPoint[] }>('/analytics/occupancy');
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export interface AppointmentVolumeResponse {
  data: Record<string, unknown>[];
  departments: string[];
}

export function useAppointmentVolume() {
  return useQuery({
    queryKey: ['analytics', 'appointments'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: AppointmentVolumeResponse }>('/analytics/appointments');
      return res.data.data;
    },
    staleTime: 60_000,
  });
}
