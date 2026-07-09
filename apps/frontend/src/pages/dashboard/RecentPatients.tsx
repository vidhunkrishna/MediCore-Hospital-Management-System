import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PatientStatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { getInitials, getAge, formatDate } from '@/lib/utils';
import type { Patient } from '@/types';

export function RecentPatients({ patients, loading }: { patients?: Patient[]; loading?: boolean }) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Recent Patients</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => navigate('/patients')}>
          View all <ArrowRight className="w-3 h-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="px-6 pb-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : !patients?.length ? (
          <div className="px-6 pb-6 text-center text-muted-foreground text-sm py-8">
            No patients found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {patients.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex items-center gap-3 px-6 py-3 hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/patients`)}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="text-[10px]">{getInitials(`${p.firstName} ${p.lastName}`)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.firstName} {p.lastName}</p>
                  <p className="text-xs text-muted-foreground">{p.mrn} · {getAge(p.dob)}y · {p.gender}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <PatientStatusBadge status={p.status} />
                  <span className="text-[10px] text-muted-foreground">{formatDate(p.createdAt)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
