import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CalendarPlus, BedDouble, Brain } from 'lucide-react';

const actions = [
  { icon: UserPlus, label: 'New Patient', sub: 'Register patient', path: '/patients', color: 'text-indigo-400', bg: 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20 hover:border-indigo-500/40' },
  { icon: CalendarPlus, label: 'Book Appointment', sub: 'Schedule a slot', path: '/appointments', color: 'text-cyan-400', bg: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20 hover:border-cyan-500/40' },
  { icon: BedDouble, label: 'Manage Beds', sub: 'View bed status', path: '/resources', color: 'text-emerald-400', bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 hover:border-emerald-500/40' },
  { icon: Brain, label: 'AI Insights', sub: 'Command center', path: '/ai-command', color: 'text-violet-400', bg: 'bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20 hover:border-violet-500/40' },
];

export function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((a, i) => (
        <motion.button
          key={a.path}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.07, duration: 0.35 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(a.path)}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 text-center cursor-pointer ${a.bg}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.bg.split(' ')[0]}`}>
            <a.icon className={`w-5 h-5 ${a.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium">{a.label}</p>
            <p className="text-[11px] text-muted-foreground">{a.sub}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
