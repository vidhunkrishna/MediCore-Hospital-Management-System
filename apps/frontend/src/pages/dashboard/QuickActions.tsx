import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CalendarPlus, BedDouble, Brain, ArrowRight } from 'lucide-react';

const actions = [
  { icon: UserPlus,    label: 'Register Patient',    sub: 'Add new patient',        path: '/patients',     color: 'text-sky-500',     bg: 'bg-sky-500/10',     border: 'hover:border-sky-500/30' },
  { icon: CalendarPlus,label: 'Book Appointment',    sub: 'Schedule a slot',        path: '/appointments', color: 'text-violet-500',  bg: 'bg-violet-500/10', border: 'hover:border-violet-500/30' },
  { icon: BedDouble,   label: 'Manage Beds',         sub: 'View bed availability',  path: '/resources',    color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/30' },
  { icon: Brain,       label: 'AI Insights',         sub: 'Command center',         path: '/ai-command',   color: 'text-primary',     bg: 'bg-primary/10',     border: 'hover:border-primary/30' },
];

export function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {actions.map((a, i) => (
        <motion.button
          key={a.path}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.06, duration: 0.3, ease: 'easeOut' }}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.975 }}
          onClick={() => navigate(a.path)}
          className={`flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card text-left transition-all duration-200 ${a.border} hover:shadow-sm group`}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${a.bg} transition-transform group-hover:scale-105`}>
            <a.icon className={`w-4 h-4 ${a.color}`} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground leading-tight truncate">{a.label}</p>
            <p className="text-[11px] text-muted-foreground truncate">{a.sub}</p>
          </div>
          <ArrowRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground flex-shrink-0 transition-colors" />
        </motion.button>
      ))}
    </div>
  );
}
