import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User } from '@/types';

const schema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Invalid email'),
  password:        z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6),
  role:            z.enum(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type FormValues = z.infer<typeof schema>;

function MediCoreMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="11" fill="url(#reg-grad)" />
      <rect x="16.5" y="9"  width="7" height="22" rx="2.5" fill="white" fillOpacity="0.96" />
      <rect x="9"    y="16.5" width="22" height="7" rx="2.5" fill="white" fillOpacity="0.96" />
      <circle cx="30" cy="10" r="3" fill="white" fillOpacity="0.65" />
      <defs>
        <linearGradient id="reg-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(160,84%,39%)" />
          <stop offset="1" stopColor="hsl(186,94%,41%)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function RegisterPage() {
  const navigate    = useNavigate();
  const login       = useAuthStore((s) => s.login);
  const [showPw, setShowPw]       = useState(false);
  const [serverErr, setServerErr] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'RECEPTIONIST' },
  });

  const onSubmit = async (data: FormValues) => {
    setServerErr('');
    try {
      const { confirmPassword, ...payload } = data;
      void confirmPassword;
      const res = await api.post<{ success: boolean; data: { token: string; user: User } }>('/auth/register', payload);
      login(res.data.data.token, res.data.data.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setServerErr(msg ?? 'Registration failed. Please try again.');
    }
  };

  const roleVal = watch('role');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/4 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-7">
          <MediCoreMark size={44} />
          <h1 className="text-xl font-bold mt-3 tracking-tight">MediCore</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Hospital Operations Platform</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-7 shadow-xl">
          <div className="mb-5">
            <h2 className="text-lg font-bold tracking-tight">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Register to access the hospital system</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reg-name" className="text-xs font-semibold">Full Name</Label>
              <Input id="reg-name" placeholder="Dr. Jane Doe" autoComplete="name" {...register('name')} className={errors.name ? 'border-destructive/50' : ''} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-xs font-semibold">Email address</Label>
              <Input id="reg-email" type="email" placeholder="you@hospital.com" autoComplete="email" {...register('email')} className={errors.email ? 'border-destructive/50' : ''} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Role</Label>
              <Select value={roleVal} onValueChange={(v) => setValue('role', v as FormValues['role'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="DOCTOR">Doctor</SelectItem>
                  <SelectItem value="NURSE">Nurse</SelectItem>
                  <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-pw" className="text-xs font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-pw"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 6 chars"
                    autoComplete="new-password"
                    {...register('password')}
                    className={errors.password ? 'border-destructive/50 pr-8' : 'pr-8'}
                  />
                  <button
                    type="button"
                    aria-label={showPw ? 'Hide' : 'Show'}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-cpw" className="text-xs font-semibold">Confirm</Label>
                <Input
                  id="reg-cpw"
                  type="password"
                  placeholder="Re-enter"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-destructive/50' : ''}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
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
                : <><UserPlus className="w-4 h-4 mr-2" />Create Account</>
              }
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
