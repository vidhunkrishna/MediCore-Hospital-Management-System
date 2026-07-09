import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Bed, Equipment, Staff, ApiResponse } from '@/types';

export function useBeds() {
  return useQuery({
    queryKey: ['beds'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Bed[]>>('/resources/beds');
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function useUpdateBedStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch<ApiResponse<Bed>>(`/resources/beds/${id}/status`, { status });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['beds'] }),
  });
}

export function useEquipment() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Equipment[]>>('/resources/equipment');
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Staff[]>>('/resources/staff');
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function useUpdateStaffAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, available }: { id: string; available: boolean }) => {
      const res = await api.patch<ApiResponse<Staff>>(`/resources/staff/${id}/availability`, { available });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  });
}
