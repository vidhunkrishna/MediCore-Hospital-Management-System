import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreatePatient, useUpdatePatient, type PatientFormData } from '@/hooks/usePatients';
import { useDoctors } from '@/hooks/useDoctors';
import { useUIStore } from '@/store/ui.store';
import type { Patient } from '@/types';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  dob: z.string().min(1, 'Required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodType: z.string().optional(),
  phone: z.string().min(6, 'Invalid phone'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  status: z.enum(['ADMITTED', 'OUTPATIENT', 'CRITICAL', 'DISCHARGED']),
  doctorId: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PatientModalProps {
  open: boolean;
  onClose: () => void;
  patient?: Patient | null;
}

export function PatientModal({ open, onClose, patient }: PatientModalProps) {
  const addToast = useUIStore((s) => s.addToast);
  const { data: doctors } = useDoctors();
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient(patient?.id ?? '');
  const isEdit = !!patient;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { gender: 'MALE', status: 'OUTPATIENT' },
  });

  useEffect(() => {
    if (patient) {
      reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dob: patient.dob?.slice(0, 10),
        gender: patient.gender as FormValues['gender'],
        bloodType: patient.bloodType ?? '',
        phone: patient.phone,
        email: patient.email ?? '',
        address: patient.address ?? '',
        emergencyContact: patient.emergencyContact ?? '',
        status: patient.status as FormValues['status'],
        doctorId: patient.doctorId ?? '',
        notes: patient.notes ?? '',
      });
    } else {
      reset({ gender: 'MALE', status: 'OUTPATIENT' });
    }
  }, [patient, reset]);

  const onSubmit = async (data: FormValues) => {
    const payload: PatientFormData = {
      ...data,
      email: data.email || undefined,
      bloodType: data.bloodType || undefined,
      doctorId: data.doctorId || undefined,
    };
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload);
        addToast({ title: 'Patient updated', variant: 'success' });
      } else {
        await createMutation.mutateAsync(payload);
        addToast({ title: 'Patient registered', variant: 'success' });
      }
      onClose();
    } catch {
      addToast({ title: 'Error', description: 'Could not save patient', variant: 'destructive' });
    }
  };

  const genderVal = watch('gender');
  const statusVal = watch('status');
  const doctorVal = watch('doctorId');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Patient' : 'Register New Patient'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>First Name *</Label>
              <Input {...register('firstName')} placeholder="John" />
              {errors.firstName && <p className="text-xs text-red-400">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Last Name *</Label>
              <Input {...register('lastName')} placeholder="Doe" />
              {errors.lastName && <p className="text-xs text-red-400">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date of Birth *</Label>
              <Input type="date" {...register('dob')} />
              {errors.dob && <p className="text-xs text-red-400">{errors.dob.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Gender *</Label>
              <Select value={genderVal} onValueChange={(v) => setValue('gender', v as FormValues['gender'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input {...register('phone')} placeholder="555-0100" />
              {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...register('email')} placeholder="patient@email.com" />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Blood Type</Label>
              <Select value={watch('bloodType') ?? ''} onValueChange={(v) => setValue('bloodType', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select value={statusVal} onValueChange={(v) => setValue('status', v as FormValues['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OUTPATIENT">Outpatient</SelectItem>
                  <SelectItem value="ADMITTED">Admitted</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="DISCHARGED">Discharged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Assigned Doctor</Label>
            <Select value={doctorVal ?? ''} onValueChange={(v) => setValue('doctorId', v)}>
              <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
              <SelectContent>
                {doctors?.map((s) => (
                  <SelectItem key={s.userId} value={s.userId}>{s.user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input {...register('address')} placeholder="123 Main St" />
          </div>

          <div className="space-y-1.5">
            <Label>Emergency Contact</Label>
            <Input {...register('emergencyContact')} placeholder="Name – Phone" />
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Clinical notes..."
              className="flex w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Register Patient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
