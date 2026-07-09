import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Staff } from '@/types';

export function useDoctors() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: Staff[] }>('/resources/staff');
      return res.data.data.filter((s) => s.user.role === 'DOCTOR');
    },
    staleTime: 60_000,
  });
}
