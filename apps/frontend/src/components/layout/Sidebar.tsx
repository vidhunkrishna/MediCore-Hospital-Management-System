import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Calendar, Package, BarChart3,
  Brain, FileText, Settings, ChevronLeft, LogOut,
  Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/ai-command',   icon: Brain,           label: 'AI Command',   badge: 'AI' },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { to: '/patients',     icon: Users,    label: 'Patients' },
      { to: '/appointments', icon: Calendar, label: 'Appointments' },
      { to: '/resources',    icon: Package,  label: 'Resources' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/reports',   icon: FileText,  label: 'Reports' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

// MediCore SVG logo mark
function MediCoreLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
      {/* Cross symbol */}
      <rect x="13" y="7" width="6" height="18" rx="2" fill="white" fillOpacity="0.95" />
      <rect x="7" y="13" width="18" height="6" rx="2" fill="white" fillOpacity="0.95" />
      {/* Heartbeat dot */}
      <circle cx="24" cy="8" r="2.5" fill="white" fillOpacity="0.7" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(160,84%,39%)" />
          <stop offset="1" stopColor="hsl(186,94%,41%)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Sidebar() {
  const location  = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col bg-sidebar-background border-r border-sidebar-border overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0">
            <MediCoreLogo size={32} />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="min-w-0 flex-1"
              >
                <p className="font-bold text-sm tracking-tight text-foreground">MediCore</p>
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Hospital OS</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>

        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            className="mx-auto w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Stethoscope className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            {/* Group label */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/60"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>

            {group.items.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={!sidebarOpen ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <motion.div
                    whileHover={{ x: sidebarOpen ? 2 : 0 }}
                    transition={{ duration: 0.12 }}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 mb-0.5',
                      isActive
                        ? 'text-white'
                        : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-muted/50'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-bg"
                        className="absolute inset-0 rounded-xl gradient-primary"
                        style={{ opacity: 0.92 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <item.icon
                      className={cn(
                        'relative z-10 flex-shrink-0 w-[18px] h-[18px]',
                        isActive ? 'text-white' : ''
                      )}
                      strokeWidth={isActive ? 2.5 : 1.75}
                    />

                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.12 }}
                          className={cn('relative z-10 flex-1 truncate', isActive && 'text-white')}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* AI badge */}
                    {'badge' in item && item.badge && sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          'relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-md',
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-primary/15 text-primary'
                        )}
                      >
                        {item.badge as string}
                      </motion.span>
                    )}
                  </motion.div>
                </NavLink>
              );
            })}

            {/* Divider between groups (not after last) */}
            {group.label !== 'System' && sidebarOpen && (
              <div className="mx-3 mt-2 mb-1 border-t border-sidebar-border/50" />
            )}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3 shrink-0">
        <motion.div
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
          className="flex items-center gap-3 p-1.5 rounded-xl transition-colors"
        >
          <Avatar className="flex-shrink-0 w-8 h-8 ring-2 ring-primary/25">
            <AvatarFallback className="text-[10px]">{getInitials(user?.name ?? 'U')}</AvatarFallback>
          </Avatar>

          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate capitalize">{user?.role?.toLowerCase()}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {sidebarOpen && (
            <button
              onClick={logout}
              aria-label="Sign out"
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>
      </div>
    </motion.aside>
  );
}
