import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Patient, ApiResponse, ApiMeta } from '@/types';

interface PatientsParams {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface PatientsResponse {
  data: Patient[];
  meta: ApiMeta;
}

export function usePatients(params: PatientsParams = {}) {
  const { q = '', status = '', page = 1, limit = 10 } = params;
  return useQuery({
    queryKey: ['patients', { q, status, page, limit }],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (q) p.set('q', q);
      if (status) p.set('status', status);
      const res = await api.get<{ success: boolean; data: Patient[]; meta: ApiMeta }>(`/patients?${p}`);
      return { data: res.data.data, meta: res.data.meta } as PatientsResponse;
    },
    staleTime: 15_000,
  });
}

export function usePatient(id: string | null) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
      return res.data.data;
    },
    enabled: !!id,
    staleTime: 15_000,
  });
}

export type PatientFormData = {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  bloodType?: string;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  status: string;
  doctorId?: string;
  notes?: string;
};

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PatientFormData) => {
      const res = await api.post<ApiResponse<Patient>>('/patients', data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  });
}

export function useUpdatePatient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<PatientFormData>) => {
      const res = await api.put<ApiResponse<Patient>>(`/patients/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      qc.invalidateQueries({ queryKey: ['patient', id] });
    },
  });
}
