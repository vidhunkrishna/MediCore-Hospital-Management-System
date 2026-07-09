import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '@/store/ui.store';
import { Input } from '@/components/ui/input';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':   { title: 'Dashboard',         subtitle: 'Hospital operations overview' },
  '/patients':    { title: 'Patients',           subtitle: 'Manage patient records' },
  '/appointments':{ title: 'Appointments',       subtitle: 'Schedule and track appointments' },
  '/resources':   { title: 'Resources',          subtitle: 'Beds, equipment and staff' },
  '/analytics':   { title: 'Analytics',          subtitle: 'Performance insights and trends' },
  '/ai-command':  { title: 'AI Command Center',  subtitle: 'Intelligent hospital analysis' },
  '/reports':     { title: 'Reports',            subtitle: 'Generate and export reports' },
  '/settings':    { title: 'Settings',           subtitle: 'Configure your workspace' },
};

export function Header() {
  const location = useLocation();
  const { sidebarOpen } = useUIStore();
  const matched = Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path));
  const page = matched?.[1] ?? { title: 'MediCore', subtitle: '' };

  return (
    <motion.header
      animate={{ paddingLeft: sidebarOpen ? '272px' : '88px' }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed top-0 right-0 left-0 z-30 h-16 flex items-center gap-4 px-6 border-b border-border bg-background/90 backdrop-blur-xl"
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-foreground truncate">{page.title}</h1>
        <p className="text-xs text-muted-foreground truncate">{page.subtitle}</p>
      </div>
      <div className="hidden md:flex items-center gap-2 w-64">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8 h-8 text-xs" />
        </div>
      </div>
      <button className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive" />
      </button>
    </motion.header>
  );
}
