import { motion } from 'framer-motion';
import { BedDouble, Wrench } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useUpdateBedStatus } from '@/hooks/useResources';
import { useUIStore } from '@/store/ui.store';
import type { Bed } from '@/types';

const STATUS_STYLE: Record<string, { bg: string; border: string; dot: string; label: string }> = {
  AVAILABLE:   { bg: 'bg-emerald-500/10',  border: 'border-emerald-500/30', dot: 'bg-emerald-500',  label: 'Available' },
  OCCUPIED:    { bg: 'bg-primary/10',      border: 'border-primary/30',     dot: 'bg-primary',      label: 'Occupied' },
  MAINTENANCE: { bg: 'bg-amber-500/10',    border: 'border-amber-500/30',   dot: 'bg-amber-500',    label: 'Maintenance' },
};

interface Props { beds?: Bed[]; loading?: boolean; }

export function BedGrid({ beds, loading }: Props) {
  const addToast = useUIStore((s) => s.addToast);
  const updateStatus = useUpdateBedStatus();

  const wards = beds
    ? Array.from(new Map(beds.map((b) => [b.wardId, b.ward?.name ?? b.wardId])).entries())
    : [];

  const cycleStatus = async (bed: Bed) => {
    if (bed.patients && bed.patients.length > 0) return;
    const next = bed.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
    try {
      await updateStatus.mutateAsync({ id: bed.id, status: next });
    } catch {
      addToast({ title: 'Failed to update bed', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Bed Management</CardTitle>
          {beds && (
            <div className="flex gap-3 text-xs text-muted-foreground">
              {Object.entries(STATUS_STYLE).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${v.dot}`} /> {v.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 24 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : (
          wards.map(([wardId, wardName]) => {
            const wardBeds = beds?.filter((b) => b.wardId === wardId) ?? [];
            const occupied = wardBeds.filter((b) => b.status === 'OCCUPIED').length;
            return (
              <div key={wardId}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{wardName}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {occupied}/{wardBeds.length} occupied
                  </Badge>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                  {wardBeds.map((bed, i) => {
                    const style = STATUS_STYLE[bed.status] ?? STATUS_STYLE.AVAILABLE;
                    const patient = bed.patients?.[0];
                    const isOccupied = bed.status === 'OCCUPIED';
                    return (
                      <motion.div
                        key={bed.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.01 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => !isOccupied && cycleStatus(bed)}
                        title={isOccupied && patient ? `${patient.firstName} ${patient.lastName}` : bed.status}
                        className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-150 ${style.bg} ${style.border} ${isOccupied ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                      >
                        {bed.status === 'MAINTENANCE' && (
                          <Wrench className="w-3 h-3 text-amber-500 absolute top-1 right-1" />
                        )}
                        <p className="text-[10px] font-bold leading-tight text-foreground">{bed.number}</p>
                        <p className="text-[9px] text-muted-foreground leading-tight">{bed.type.slice(0, 3)}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
