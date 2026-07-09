import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Bell, Search, ChevronDown, Sun, Moon, LogOut, User, Settings } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useTheme } from '@/lib/theme';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { usePatients } from '@/hooks/usePatients';
import { useDoctors } from '@/hooks/useDoctors';
import { useAppointments } from '@/hooks/useAppointments';
import { useEquipment, useBeds } from '@/hooks/useResources';
import { useDebounce } from '@/hooks/useDebounce';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':    { title: 'Dashboard',        subtitle: 'Hospital operations overview' },
  '/patients':     { title: 'Patients',          subtitle: 'Manage patient records' },
  '/appointments': { title: 'Appointments',      subtitle: 'Schedule and track appointments' },
  '/resources':    { title: 'Resources',         subtitle: 'Beds, equipment and staff' },
  '/analytics':    { title: 'Analytics',         subtitle: 'Performance insights and trends' },
  '/ai-command':   { title: 'AI Command Center', subtitle: 'Intelligent hospital analysis' },
  '/reports':      { title: 'Reports',           subtitle: 'Generate and export reports' },
  '/settings':     { title: 'Settings',          subtitle: 'Configure your workspace' },
};

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'alert';
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New patient registered',
    description: 'Robert Johnson has been registered as an outpatient.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
    type: 'success',
  },
  {
    id: '2',
    title: 'Appointment scheduled',
    description: 'Dr. James Wilson has a new appointment at 10:30 AM.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    type: 'info',
  },
  {
    id: '3',
    title: 'Bed occupancy critical',
    description: 'ICU capacity has reached 95%. Consider transfers.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    type: 'alert',
  },
  {
    id: '4',
    title: 'Equipment maintenance due',
    description: 'Ventilator Unit 3 requires safety check inspection.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: true,
    type: 'warning',
  },
  {
    id: '5',
    title: 'AI recommendation',
    description: 'Optimize morning nurse shifts in cardiology ward.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    type: 'info',
  },
  {
    id: '6',
    title: 'Daily report available',
    description: 'Financial and operations report for yesterday is ready.',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    read: true,
    type: 'success',
  },
];

function formatTime(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { mode, setMode } = useTheme();

  // Search parameters for syncing tab queries
  const [, setSearchParams] = useSearchParams();

  // Dropdown states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // References for click-away
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('hospital_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      localStorage.setItem('hospital_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
      setNotifications(DEFAULT_NOTIFICATIONS);
    }
  }, []);

  const saveNotifications = (newNotifs: Notification[]) => {
    localStorage.setItem('hospital_notifications', JSON.stringify(newNotifs));
    setNotifications(newNotifs);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(updated);
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearAllNotifs = () => {
    saveNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Search Data Queries
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: patientsData } = usePatients({ q: debouncedSearch, limit: 5 });
  const { data: doctorsData } = useDoctors();
  const { data: appointmentsData } = useAppointments({ limit: 100 });
  const { data: equipmentData } = useEquipment();
  const { data: bedsData } = useBeds();

  // Client-side filtering
  const queryLower = debouncedSearch.toLowerCase().trim();

  const filteredPatients = searchQuery ? (patientsData?.data || []).slice(0, 5) : [];

  const filteredDoctors = queryLower
    ? (doctorsData || []).filter(
        (d) =>
          d.user.name.toLowerCase().includes(queryLower) ||
          d.department?.name.toLowerCase().includes(queryLower)
      ).slice(0, 5)
    : [];

  const filteredAppointments = queryLower
    ? (appointmentsData?.data || []).filter((appt) => {
        const patientName = appt.patient
          ? `${appt.patient.firstName} ${appt.patient.lastName}`.toLowerCase()
          : '';
        const doctorName = appt.doctor?.name.toLowerCase() ?? '';
        const mrn = appt.patient?.mrn.toLowerCase() ?? '';
        return (
          patientName.includes(queryLower) ||
          doctorName.includes(queryLower) ||
          mrn.includes(queryLower) ||
          appt.type.toLowerCase().includes(queryLower)
        );
      }).slice(0, 5)
    : [];

  const filteredEquipment = queryLower
    ? (equipmentData || []).filter(
        (eq) =>
          eq.name.toLowerCase().includes(queryLower) ||
          eq.category.toLowerCase().includes(queryLower) ||
          eq.serialNo.toLowerCase().includes(queryLower)
      ).slice(0, 5)
    : [];

  const filteredBeds = queryLower
    ? (bedsData || []).filter(
        (b) =>
          b.number.toLowerCase().includes(queryLower) ||
          b.type.toLowerCase().includes(queryLower) ||
          b.ward?.name.toLowerCase().includes(queryLower)
      ).slice(0, 5)
    : [];

  // Group search results
  const groupedResults = [];
  if (filteredPatients.length > 0) {
    groupedResults.push({
      category: 'Patients',
      items: filteredPatients.map((p) => ({
        id: p.id,
        title: `${p.firstName} ${p.lastName}`,
        subtitle: `MRN: ${p.mrn}`,
        url: `/patients`,
      })),
    });
  }
  if (filteredDoctors.length > 0) {
    groupedResults.push({
      category: 'Doctors',
      items: filteredDoctors.map((d) => ({
        id: d.id,
        title: d.user.name,
        subtitle: d.department?.name ?? 'General',
        url: `/resources?tab=staff`,
      })),
    });
  }
  if (filteredAppointments.length > 0) {
    groupedResults.push({
      category: 'Appointments',
      items: filteredAppointments.map((a) => ({
        id: a.id,
        title: a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : '—',
        subtitle: `${a.type.replace('_', ' ')} with ${a.doctor?.name ?? 'Doctor'}`,
        url: `/appointments`,
      })),
    });
  }
  if (filteredEquipment.length > 0) {
    groupedResults.push({
      category: 'Equipment',
      items: filteredEquipment.map((eq) => ({
        id: eq.id,
        title: eq.name,
        subtitle: `S/N: ${eq.serialNo} · ${eq.category}`,
        url: `/resources?tab=equipment`,
      })),
    });
  }
  if (filteredBeds.length > 0) {
    groupedResults.push({
      category: 'Beds',
      items: filteredBeds.map((b) => ({
        id: b.id,
        title: `Bed ${b.number}`,
        subtitle: `${b.type} · ${b.status}`,
        url: `/resources?tab=beds`,
      })),
    });
  }

  const flatItems = groupedResults.reduce((acc, group) => {
    return [...acc, ...group.items];
  }, [] as SearchItem[]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [flatItems.length]);

  // Click Outside hooks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
        setSearchFocused(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleSelectResult = (item: SearchItem) => {
    setSearchQuery('');
    setSearchFocused(false);
    
    // Parse tab parameter if navigating to resources
    if (item.url.startsWith('/resources?tab=')) {
      const tabName = item.url.split('?tab=')[1];
      setSearchParams({ tab: tabName });
      navigate('/resources');
    } else {
      navigate(item.url);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatItems.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[selectedIdx]) {
        handleSelectResult(flatItems[selectedIdx]);
      }
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

  const matched = Object.entries(pageMeta).find(([p]) => location.pathname.startsWith(p));
  const page = matched?.[1] ?? { title: 'MediCore', subtitle: '' };
  const showSearchDropdown = searchFocused && searchQuery.trim().length > 0;

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.header
      animate={{ paddingLeft: sidebarOpen ? '276px' : '88px' }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 right-0 left-0 z-30 h-14 flex items-center gap-4 px-6 border-b border-border bg-background/95 backdrop-blur-xl"
    >
      {/* Page context */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-foreground leading-none">{page.title}</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-none">{page.subtitle}</p>
      </div>

      {/* Search */}
      <div ref={searchRef} className="hidden md:flex items-center gap-2 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchFocused(true);
            }}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search patients, records..."
            aria-label="Search"
            className="h-8 w-56 pl-9 pr-3 rounded-lg border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary/50 transition-all duration-150 focus:w-64"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/60 font-mono border border-border rounded px-1 py-0.5 leading-none hidden lg:block">
            ⌘K
          </kbd>
        </div>

        {/* Global Search Dropdown */}
        <AnimatePresence>
          {showSearchDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-2 w-[380px] bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 text-left"
            >
              <div className="max-h-[360px] overflow-y-auto p-1.5 space-y-3">
                {flatItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No matching records found.
                  </div>
                ) : (
                  groupedResults.map((group) => (
                    <div key={group.category} className="space-y-1">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/20 rounded">
                        {group.category}
                      </div>
                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const isSelected = flatItems[selectedIdx]?.id === item.id && flatItems[selectedIdx]?.url === item.url;
                          return (
                            <div
                              key={`${item.id}-${item.url}`}
                              onClick={() => handleSelectResult(item)}
                              className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-muted/50 text-foreground'
                              }`}
                            >
                              <p className="text-xs font-semibold">{item.title}</p>
                              <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                {item.subtitle}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center leading-none"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {notifDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 text-left"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                  <span className="text-xs font-semibold text-foreground">Notifications</span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[10px] text-primary font-medium hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifs}
                        className="text-[10px] text-muted-foreground font-medium hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* List */}
                <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                      <Bell className="w-8 h-8 text-muted-foreground/35 mb-1.5" />
                      <p className="text-xs">All caught up!</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3.5 hover:bg-muted/30 transition-colors cursor-pointer flex gap-3 ${
                          !n.read ? 'bg-primary/[0.02]' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs font-semibold truncate ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {formatTime(n.timestamp)}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                            {n.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center">
                          <span className={`w-1.5 h-1.5 rounded-full ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* User chip */}
        <div ref={userMenuRef} className="relative">
          <button
            aria-label="User menu"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-lg hover:bg-muted transition-colors group"
          >
            <Avatar className="w-6 h-6 ring-1 ring-primary/30">
              <AvatarFallback className="text-[9px]">{getInitials(user?.name ?? 'U')}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-xs font-medium text-foreground max-w-[90px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>

          {/* User Profile Menu Dropdown */}
          <AnimatePresence>
            {userDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 text-left"
              >
                {/* User details header */}
                <div className="p-3 border-b border-border bg-muted/20 flex items-center gap-2.5">
                  <Avatar className="w-8 h-8 ring-1 ring-primary/30">
                    <AvatarFallback className="text-[10px]">{getInitials(user?.name ?? 'U')}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                    <p className="text-[9px] font-bold text-primary mt-0.5 uppercase tracking-wider bg-primary/10 w-fit px-1.5 py-0.5 rounded leading-none">
                      {user?.role}
                    </p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/settings?tab=profile');
                    }}
                    className="flex items-center gap-2 w-full px-2.5 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className="flex items-center gap-2 w-full px-2.5 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                    Settings
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center justify-between w-full px-2.5 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {mode === 'dark' ? (
                        <Moon className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      Theme Mode
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground/80 uppercase bg-muted px-1.5 py-0.5 rounded leading-none">
                      {mode}
                    </span>
                  </button>
                </div>

                <div className="p-1 border-t border-border">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-2.5 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
