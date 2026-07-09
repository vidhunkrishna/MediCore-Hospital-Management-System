import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Building2, Save, Loader2, Check, Settings } from 'lucide-react';
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
  name:  z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
});
type ProfileValues = z.infer<typeof profileSchema>;

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User,      description: 'Personal info' },
  { id: 'hospital',      label: 'Hospital',       icon: Building2, description: 'Facility details' },
  { id: 'notifications', label: 'Notifications',  icon: Bell,      description: 'Alert preferences' },
  { id: 'appearance',    label: 'Appearance',     icon: Palette,   description: 'Theme & colors' },
  { id: 'security',      label: 'Security',       icon: Shield,    description: 'Session & auth' },
] as const;
type Tab = (typeof TABS)[number]['id'];

const HOSPITAL_INFO = {
  name:        'MediCore General Hospital',
  address:     '123 Healthcare Blvd, Medical City, MC 10001',
  phone:       '+1 (555) 000-0100',
  license:     'LIC-2024-MCG-001',
  beds:        60,
  departments: 5,
};

const ROLE_COLOR: Record<string, string> = {
  ADMIN:         'bg-violet-500/15 text-violet-500 border-violet-500/25',
  DOCTOR:        'bg-sky-500/15 text-sky-500 border-sky-500/25',
  NURSE:         'bg-emerald-500/15 text-emerald-500 border-emerald-500/25',
  RECEPTIONIST:  'bg-amber-500/15 text-amber-500 border-amber-500/25',
};

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');
  const { user, setUser }   = useAuthStore();
  const addToast            = useUIStore((s) => s.addToast);
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
    <div className="space-y-6 max-w-5xl">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
          <Settings className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Settings</h2>
          <p className="text-xs text-muted-foreground">Manage your account, preferences and security</p>
        </div>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Tab sidebar */}
        <nav className="flex flex-row md:flex-col gap-1 md:w-48 flex-shrink-0 md:bg-card md:border md:border-border md:rounded-2xl md:p-2" aria-label="Settings sections">
          {TABS.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group w-full ${
                tab === id
                  ? 'gradient-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
              <div className="min-w-0 hidden md:block">
                <p className="text-xs font-semibold leading-none">{label}</p>
                <p className={`text-[10px] mt-0.5 leading-none truncate ${tab === id ? 'text-white/70' : 'text-muted-foreground'}`}>{description}</p>
              </div>
              <span className="md:hidden text-xs font-semibold">{label}</span>
            </button>
          ))}
        </nav>

        {/* Content panel */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="flex-1 min-w-0"
        >
          {tab === 'profile' && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Avatar row */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <Avatar className="w-14 h-14 ring-2 ring-primary/25">
                    <AvatarFallback className="text-base">{getInitials(user?.name ?? 'U')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{user?.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                    <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${ROLE_COLOR[user?.role ?? ''] ?? 'bg-muted text-muted-foreground border-border'}`}>
                      {user?.role?.toLowerCase()}
                    </span>
                  </div>
                </div>

                <Separator />

                <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="s-name" className="text-xs font-semibold">Full Name</Label>
                      <Input id="s-name" {...register('name')} className={errors.name ? 'border-destructive/50' : ''} />
                      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="s-email" className="text-xs font-semibold">Email Address</Label>
                      <Input id="s-email" type="email" {...register('email')} className={errors.email ? 'border-destructive/50' : ''} />
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Role</Label>
                    <Input value={user?.role ?? ''} readOnly className="opacity-50 cursor-not-allowed" />
                    <p className="text-[11px] text-muted-foreground">Role assignment is managed by system administrators.</p>
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2 h-9 px-5">
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
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold">Hospital Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0 p-0">
                {Object.entries(HOSPITAL_INFO).map(([key, val], i, arr) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between px-6 py-3.5 ${i !== arr.length - 1 ? 'border-b border-border/40' : ''} hover:bg-muted/20 transition-colors`}
                  >
                    <span className="text-xs font-medium text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-sm font-semibold text-right max-w-[60%]">{String(val)}</span>
                  </div>
                ))}
                <div className="px-6 py-3">
                  <p className="text-xs text-muted-foreground">Hospital configuration is managed by system administrators.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'notifications' && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0 p-0">
                {(Object.keys(notifs) as (keyof typeof notifs)[]).map((k, i, arr) => (
                  <div
                    key={k}
                    className={`flex items-center justify-between px-6 py-4 ${i !== arr.length - 1 ? 'border-b border-border/40' : ''}`}
                  >
                    <div>
                      <p className="text-sm font-medium capitalize">{k} notifications</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Receive alerts for {k} events</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={notifs[k]}
                      aria-label={`Toggle ${k} notifications`}
                      onClick={() => toggleNotif(k)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${notifs[k] ? 'gradient-primary' : 'bg-muted'}`}
                    >
                      <motion.span
                        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                        animate={{ x: notifs[k] ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {tab === 'appearance' && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold">Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Theme mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Theme Mode</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Currently: <span className="font-semibold text-foreground">{mode === 'dark' ? 'Dark' : 'Light'}</span></p>
                  </div>
                  <div className="flex gap-1.5 p-1 bg-muted/40 rounded-xl border border-border">
                    {(['Dark', 'Light'] as const).map((t) => {
                      const val = t.toLowerCase() as 'dark' | 'light';
                      return (
                        <button
                          key={t}
                          onClick={() => setMode(val)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            mode === val
                              ? 'gradient-primary text-white shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Accent color */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Accent Color</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Sets button, badge, and navigation accent</p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {(Object.entries(ACCENT_MAP) as [AccentColor, typeof ACCENT_MAP[AccentColor]][]).map(([key, def]) => (
                      <button
                        key={key}
                        aria-label={`Set accent to ${def.label}`}
                        title={def.label}
                        onClick={() => setAccent(key)}
                        className="relative w-9 h-9 rounded-full transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-center"
                        style={{
                          backgroundColor: def.hex,
                          boxShadow: accent === key ? `0 0 0 3px hsl(var(--background)), 0 0 0 5px ${def.hex}` : 'none',
                        }}
                      >
                        {accent === key && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Changes apply immediately and persist after page refresh.</p>
                </div>

                {/* Color preview */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Preview</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="h-8 text-xs">Primary button</Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs">Secondary</Button>
                    <Badge variant="default">Badge</Badge>
                    <Badge variant="success">Success</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'security' && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold">Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Session status */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-emerald-500" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-500">Session Active</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Signed in as <span className="text-foreground font-medium">{user?.email}</span>
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {[
                    { title: 'Password', body: 'Password changes require re-authentication. Contact your administrator to initiate a reset.' },
                    { title: 'Session Token', body: 'JWT session expires in 7 days. You will be automatically redirected to login on expiry.' },
                    { title: 'Multi-factor Authentication', body: 'MFA support is planned for a future release.' },
                  ].map((s) => (
                    <div key={s.title} className="space-y-0.5 py-2 border-b border-border/40 last:border-0">
                      <p className="text-sm font-semibold">{s.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
