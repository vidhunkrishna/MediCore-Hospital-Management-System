import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Building2, Save, Loader2, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useTheme, ACCENT_MAP, type AccentColor } from '@/lib/theme';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import type { User as UserType } from '@/types';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
});
type ProfileValues = z.infer<typeof profileSchema>;

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'hospital',      label: 'Hospital',       icon: Building2 },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'appearance',    label: 'Appearance',     icon: Palette },
  { id: 'security',      label: 'Security',       icon: Shield },
] as const;
type Tab = (typeof TABS)[number]['id'];

const HOSPITAL_INFO = {
  name: 'MediCore General Hospital',
  address: '123 Healthcare Blvd, Medical City, MC 10001',
  phone: '+1 (555) 000-0100',
  license: 'LIC-2024-MCG-001',
  beds: 60,
  departments: 5,
};

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');
  const { user, setUser } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);
  const { mode, accent, setMode, setAccent } = useTheme();

  const [notifs, setNotifs] = useState({ alerts: true, appointments: true, patients: false, reports: false });
  const toggleNotif = (k: keyof typeof notifs) => setNotifs((n) => ({ ...n, [k]: !n[k] }));

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const onSaveProfile = async (data: ProfileValues) => {
    try {
      const res = await api.get<{ success: boolean; data: UserType }>('/auth/me');
      setUser({ ...res.data.data, ...data });
      addToast({ title: 'Profile updated', variant: 'success' });
    } catch {
      addToast({ title: 'Failed to update profile', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </motion.div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <nav className="flex flex-col gap-1 w-44 flex-shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                tab === id
                  ? 'gradient-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <motion.div key={tab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18 }} className="flex-1 min-w-0">

          {tab === 'profile' && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-lg">{getInitials(user?.name ?? 'U')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user?.name}</p>
                    <Badge variant="secondary" className="mt-1 capitalize text-xs">{user?.role?.toLowerCase()}</Badge>
                  </div>
                </div>

                <Separator />

                <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="s-name">Full Name</Label>
                      <Input id="s-name" {...register('name')} className={errors.name ? 'border-red-500/50' : ''} />
                      {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="s-email">Email</Label>
                      <Input id="s-email" type="email" {...register('email')} className={errors.email ? 'border-red-500/50' : ''} />
                      {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <Input value={user?.role ?? ''} readOnly className="opacity-60 cursor-not-allowed" />
                    <p className="text-xs text-muted-foreground">Role cannot be changed from this panel.</p>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2">
                      {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {tab === 'hospital' && (
            <Card>
              <CardHeader className="pb-4"><CardTitle className="text-base">Hospital Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(HOSPITAL_INFO).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                    <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-sm font-medium">{String(val)}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2">Hospital configuration is managed by system administrators.</p>
              </CardContent>
            </Card>
          )}

          {tab === 'notifications' && (
            <Card>
              <CardHeader className="pb-4"><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {(Object.keys(notifs) as (keyof typeof notifs)[]).map((k) => (
                  <div key={k} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                    <div>
                      <p className="text-sm font-medium capitalize">{k} notifications</p>
                      <p className="text-xs text-muted-foreground">Receive alerts for {k} events</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={notifs[k]}
                      onClick={() => toggleNotif(k)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring ${notifs[k] ? 'bg-primary' : 'bg-secondary'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${notifs[k] ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {tab === 'appearance' && (
            <Card>
              <CardHeader className="pb-4"><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-muted-foreground">Current theme: {mode === 'dark' ? 'Dark' : 'Light'}</p>
                  </div>
                  <div className="flex gap-2">
                    {(['Dark', 'Light'] as const).map((t) => {
                      const val = t.toLowerCase() as 'dark' | 'light';
                      const isActive = mode === val;
                      return (
                        <button
                          key={t}
                          onClick={() => setMode(val)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${isActive ? 'gradient-primary text-white border-transparent' : 'border-border text-muted-foreground hover:text-foreground'}`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Accent Color</p>
                  <div className="flex gap-3">
                    {(Object.entries(ACCENT_MAP) as [AccentColor, typeof ACCENT_MAP[AccentColor]][]).map(([key, def]) => (
                      <button
                        key={key}
                        aria-label={`Set accent color ${def.label}`}
                        title={def.label}
                        onClick={() => setAccent(key)}
                        className="relative w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform flex items-center justify-center"
                        style={{ backgroundColor: def.hex, borderColor: accent === key ? 'white' : 'transparent' }}
                      >
                        {accent === key && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Changes apply immediately and persist after refresh.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'security' && (
            <Card>
              <CardHeader className="pb-4"><CardTitle className="text-base">Security</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm font-semibold text-emerald-400">Session Active</p>
                  <p className="text-xs text-muted-foreground mt-1">You are currently logged in as <span className="text-foreground font-medium">{user?.email}</span></p>
                </div>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-semibold">Password</p>
                  <p className="text-xs text-muted-foreground">Password changes require re-authentication. Contact your administrator to reset your password.</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-semibold">JWT Session</p>
                  <p className="text-xs text-muted-foreground">Your session token expires in 7 days. You will be automatically redirected to login on expiry.</p>
                </div>
              </CardContent>
            </Card>
          )}

        </motion.div>
      </div>
    </div>
  );
}
