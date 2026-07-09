import { motion } from 'framer-motion';
import { Wrench, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { formatDate } from '@/lib/utils';
import type { Equipment } from '@/types';

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'secondary'; icon: React.ReactNode }> = {
  OPERATIONAL: { variant: 'success',   icon: <CheckCircle2 className="w-3 h-3" /> },
  MAINTENANCE: { variant: 'warning',   icon: <Wrench className="w-3 h-3" /> },
  RETIRED:     { variant: 'secondary', icon: <XCircle className="w-3 h-3" /> },
};

interface Props { equipment?: Equipment[]; loading?: boolean; }

export function EquipmentTable({ equipment, loading }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Equipment ({equipment?.length ?? 0})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-muted/30 border-y border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          <span>Name</span><span>Category</span><span>Department</span><span>Status</span><span>Next Service</span>
        </div>
        {loading ? (
          <TableSkeleton rows={6} cols={5} gridTemplateColumns="2fr 1fr 1fr 1fr 1fr" />
        ) : (
          <div className="divide-y divide-border">
            {equipment?.map((eq, i) => {
              const cfg = STATUS_CONFIG[eq.status] ?? STATUS_CONFIG.OPERATIONAL;
              return (
                <motion.div
                  key={eq.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 items-center hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{eq.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{eq.serialNo}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{eq.category}</span>
                  <span className="text-sm text-muted-foreground truncate">{eq.department?.name ?? '—'}</span>
                  <Badge variant={cfg.variant} className="gap-1 w-fit">
                    {cfg.icon} {eq.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {eq.nextService ? formatDate(eq.nextService) : '—'}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
