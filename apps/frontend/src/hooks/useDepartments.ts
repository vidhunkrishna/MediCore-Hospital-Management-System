import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Staff } from '@/types';

export interface DepartmentOption {
  id: string;
  name: string;
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async (): Promise<DepartmentOption[]> => {
      const res = await api.get<{ success: boolean; data: Staff[] }>('/resources/staff');
      const seen = new Map<string, string>();
      res.data.data.forEach((s) => {
        if (!seen.has(s.departmentId)) seen.set(s.departmentId, s.department.name);
      });
      return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
    },
    staleTime: 60_000,
  });
}
