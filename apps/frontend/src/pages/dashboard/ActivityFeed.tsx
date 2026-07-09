import { motion } from 'framer-motion';
import { UserPlus, Calendar, BedDouble, AlertTriangle, CheckCircle2, LogOut } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  text: string;
  sub: string;
  time: string;
}

const mockActivity: ActivityItem[] = [
  { id: '1', icon: <UserPlus className="w-3.5 h-3.5 text-indigo-500" />,   iconBg: 'bg-indigo-500/15', text: 'New patient admitted',     sub: 'Robert Johnson — Ward A, Bed CA02',    time: '2m ago' },
  { id: '2', icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />, iconBg: 'bg-red-500/15',    text: 'Critical alert raised',    sub: 'ICU at 95% capacity',                  time: '8m ago' },
  { id: '3', icon: <Calendar className="w-3.5 h-3.5 text-cyan-500" />,     iconBg: 'bg-cyan-500/15',   text: 'Appointment confirmed',    sub: 'Emily Chen — Dr. James Wilson',        time: '15m ago' },
  { id: '4', icon: <BedDouble className="w-3.5 h-3.5 text-amber-500" />,   iconBg: 'bg-amber-500/15',  text: 'Bed status updated',       sub: 'OR02 → Maintenance',                   time: '22m ago' },
  { id: '5', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />, iconBg: 'bg-emerald-500/15', text: 'Appointment completed', sub: 'Michael Davis — Neurology',            time: '34m ago' },
  { id: '6', icon: <LogOut className="w-3.5 h-3.5 text-muted-foreground" />, iconBg: 'bg-muted',      text: 'Patient discharged',       sub: 'Liam Moore — Orthopedics',             time: '1h ago' },
  { id: '7', icon: <UserPlus className="w-3.5 h-3.5 text-indigo-500" />,   iconBg: 'bg-indigo-500/15', text: 'New patient registered',   sub: 'Sophia Martinez — Cardiology',         time: '1h ago' },
];

export function ActivityFeed({ loading }: { loading?: boolean }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto max-h-80 space-y-1 pr-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-2">
              <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2.5 w-28" />
              </div>
            </div>
          ))
          : mockActivity.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-start gap-3 py-2 px-2 rounded-xl hover:bg-muted/50 transition-colors group"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.text}</p>
                <p className="text-[11px] text-muted-foreground truncate">{item.sub}</p>
              </div>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">{item.time}</span>
            </motion.div>
          ))
        }
      </CardContent>
    </Card>
  );
}
