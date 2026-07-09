import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUpdateStaffAvailability } from '@/hooks/useResources';
import { useUIStore } from '@/store/ui.store';
import { getInitials } from '@/lib/utils';
import type { Staff } from '@/types';

const SHIFT_COLOR: Record<string, string> = {
  MORNING:   'text-amber-500',
  AFTERNOON: 'text-cyan-500',
  NIGHT:     'text-primary',
};

interface Props { staff?: Staff[]; loading?: boolean; }

export function StaffRoster({ staff, loading }: Props) {
  const addToast = useUIStore((s) => s.addToast);
  const updateAvail = useUpdateStaffAvailability();

  const toggle = async (s: Staff) => {
    try {
      await updateAvail.mutateAsync({ id: s.id, available: !s.available });
    } catch {
      addToast({ title: 'Failed to update availability', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Staff Roster ({staff?.length ?? 0})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Staff</span><span>Role</span><span>Department</span><span>Shift</span><span>Available</span>
        </div>
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-3.5 w-28" />
                </div>
                {Array.from({ length: 3 }).map((__, j) => <Skeleton key={j} className="h-3 w-16" />)}
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {staff?.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 items-center hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-[10px]">{getInitials(s.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.user.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] w-fit capitalize">{s.user.role.toLowerCase()}</Badge>
                <span className="text-sm text-muted-foreground truncate">{s.department?.name ?? '—'}</span>
                <span className={`text-xs font-medium ${SHIFT_COLOR[s.shift] ?? 'text-muted-foreground'}`}>{s.shift}</span>
                <Button
                  size="sm"
                  variant={s.available ? 'outline' : 'secondary'}
                  className="h-7 text-xs"
                  onClick={() => toggle(s)}
                >
                  {s.available ? '✓ Available' : '✗ Off duty'}
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
