import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Appointment, ApiResponse, ApiMeta } from '@/types';

interface AppointmentsParams {
  q?: string;
  status?: string;
  doctorId?: string;
  page?: number;
  limit?: number;
}

export function useAppointments(params: AppointmentsParams = {}) {
  const { status = '', doctorId = '', page = 1, limit = 10 } = params;
  return useQuery({
    queryKey: ['appointments', { status, doctorId, page, limit }],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) p.set('status', status);
      if (doctorId) p.set('doctorId', doctorId);
      const res = await api.get<{ success: boolean; data: Appointment[]; meta: ApiMeta }>(`/appointments?${p}`);
      return { data: res.data.data, meta: res.data.meta };
    },
    staleTime: 15_000,
  });
}

export type AppointmentFormData = {
  patientId: string;
  doctorId: string;
  departmentId: string;
  scheduledAt: string;
  duration: number;
  type: string;
  notes?: string;
};

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      const res = await api.post<ApiResponse<Appointment>>('/appointments', data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
}

export function useUpdateAppointment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AppointmentFormData>) => {
      const res = await api.put<ApiResponse<Appointment>>(`/appointments/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
}
