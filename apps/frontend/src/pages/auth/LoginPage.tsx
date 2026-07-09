import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User } from '@/types';

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormValues = z.infer<typeof schema>;

const demoAccounts = [
  { label: 'Admin',  email: 'admin@hospital.com' },
  { label: 'Doctor', email: 'dr.james@hospital.com' },
  { label: 'Nurse',  email: 'nurse.anna@hospital.com' },
];

// MediCore mark — inline for auth pages
function MediCoreMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="11" fill="url(#auth-grad)" />
      <rect x="16.5" y="9"  width="7" height="22" rx="2.5" fill="white" fillOpacity="0.96" />
      <rect x="9"    y="16.5" width="22" height="7" rx="2.5" fill="white" fillOpacity="0.96" />
      <circle cx="30" cy="10" r="3" fill="white" fillOpacity="0.65" />
      <defs>
        <linearGradient id="auth-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(160,84%,39%)" />
          <stop offset="1" stopColor="hsl(186,94%,41%)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const login    = useAuthStore((s) => s.login);
  const [showPw, setShowPw]       = useState(false);
  const [serverErr, setServerErr] = useState('');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setServerErr('');
    try {
      const res = await api.post<{ success: boolean; data: { token: string; user: User } }>('/auth/login', data);
      login(res.data.data.token, res.data.data.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setServerErr(msg ?? 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[40%] flex-col justify-between p-10 bg-card border-r border-border">
        <div className="flex items-center gap-3">
          <MediCoreMark size={36} />
          <div>
            <p className="font-bold text-sm tracking-tight">MediCore</p>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Hospital OS</p>
          </div>
        </div>

        <div>
          <blockquote className="text-2xl font-semibold leading-tight text-foreground mb-6">
            "Intelligent operations<br />for modern healthcare."
          </blockquote>
          <div className="space-y-3">
            {[
              { icon: '🏥', text: 'Real-time patient monitoring' },
              { icon: '🤖', text: 'AI-powered operations center' },
              { icon: '📊', text: 'Advanced analytics & insights' },
              { icon: '🔔', text: 'Intelligent alert management' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground/50">© 2025 MediCore. Hospital Operations Platform.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full bg-primary/4 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <MediCoreMark size={44} />
            <h1 className="text-xl font-bold mt-3">MediCore</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Hospital Operations Platform</p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to continue to MediCore</p>
          </div>

          {/* Demo quick-fill */}
          <div className="mb-5">
            <p className="text-[11px] text-muted-foreground mb-2 font-medium">Quick demo access</p>
            <div className="flex gap-2">
              {demoAccounts.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => { setValue('email', a.email); setValue('password', 'password123'); }}
                  className="flex-1 text-xs py-1.5 px-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-150 font-medium"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@hospital.com"
                autoComplete="email"
                {...register('email')}
                className={errors.email ? 'border-destructive/50' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className={errors.password ? 'border-destructive/50 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {serverErr && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
              >
                {serverErr}
              </motion.p>
            )}

            <Button type="submit" className="w-full h-10 text-sm font-semibold" disabled={isSubmitting}>
              {isSubmitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Sign in securely
                  </>
              }
            </Button>
          </form>

          <div className="mt-5 space-y-2 text-center">
            <p className="text-xs text-muted-foreground">
              Demo password: <span className="text-foreground font-semibold">password123</span>
            </p>
            <p className="text-xs text-muted-foreground">
              New staff member?{' '}
              <Link to="/register" className="text-primary hover:underline font-semibold">Create account</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
