import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus, Save } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, Textarea } from '@/components/shared/FormField';
import { useCreatePatient, useUpdatePatient, type PatientFormData } from '@/hooks/usePatients';
import { useDoctors } from '@/hooks/useDoctors';
import { useUIStore } from '@/store/ui.store';
import type { Patient } from '@/types';

const schema = z.object({
  firstName:        z.string().min(1, 'First name is required'),
  lastName:         z.string().min(1, 'Last name is required'),
  dob:              z.string().min(1, 'Date of birth is required'),
  gender:           z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodType:        z.string().optional(),
  phone:            z.string().min(6, 'Enter a valid phone number'),
  email:            z.string().email('Enter a valid email').optional().or(z.literal('')),
  address:          z.string().optional(),
  emergencyContact: z.string().optional(),
  status:           z.enum(['ADMITTED', 'OUTPATIENT', 'CRITICAL', 'DISCHARGED']),
  doctorId:         z.string().optional(),
  notes:            z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PatientModalProps {
  open: boolean;
  onClose: () => void;
  patient?: Patient | null;
}

export function PatientModal({ open, onClose, patient }: PatientModalProps) {
  const addToast     = useUIStore((s) => s.addToast);
  const { data: doctors } = useDoctors();
  const createMutation    = useCreatePatient();
  const updateMutation    = useUpdatePatient(patient?.id ?? '');
  const isEdit            = !!patient;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { gender: 'MALE', status: 'OUTPATIENT' },
    });

  useEffect(() => {
    if (patient) {
      reset({
        firstName:        patient.firstName,
        lastName:         patient.lastName,
        dob:              patient.dob?.slice(0, 10),
        gender:           patient.gender as FormValues['gender'],
        bloodType:        patient.bloodType ?? '',
        phone:            patient.phone,
        email:            patient.email ?? '',
        address:          patient.address ?? '',
        emergencyContact: patient.emergencyContact ?? '',
        status:           patient.status as FormValues['status'],
        doctorId:         patient.doctorId ?? '',
        notes:            patient.notes ?? '',
      });
    } else {
      reset({ gender: 'MALE', status: 'OUTPATIENT' });
    }
  }, [patient, reset]);

  const onSubmit = async (data: FormValues) => {
    const payload: PatientFormData = {
      ...data,
      email:     data.email     || undefined,
      bloodType: data.bloodType || undefined,
      doctorId:  data.doctorId  || undefined,
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
      addToast({ title: 'Error saving patient', description: 'Please try again', variant: 'destructive' });
    }
  };

  const genderVal = watch('gender');
  const statusVal = watch('status');
  const doctorVal = watch('doctorId');
  const bloodVal  = watch('bloodType');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
              {isEdit ? <Save className="w-4 h-4 text-white" /> : <UserPlus className="w-4 h-4 text-white" />}
            </div>
            <DialogTitle className="text-base font-semibold">
              {isEdit ? 'Edit Patient' : 'Register New Patient'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
          {/* Section: Personal */}
          <SectionLabel>Personal Information</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required error={errors.firstName?.message}>
              <Input
                {...register('firstName')}
                placeholder="John"
                className={errors.firstName ? 'border-destructive/50' : ''}
                aria-invalid={!!errors.firstName}
              />
            </FormField>
            <FormField label="Last Name" required error={errors.lastName?.message}>
              <Input
                {...register('lastName')}
                placeholder="Doe"
                className={errors.lastName ? 'border-destructive/50' : ''}
                aria-invalid={!!errors.lastName}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date of Birth" required error={errors.dob?.message}>
              <Input
                type="date"
                {...register('dob')}
                className={errors.dob ? 'border-destructive/50' : ''}
                aria-invalid={!!errors.dob}
              />
            </FormField>
            <FormField label="Gender" required>
              <Select value={genderVal} onValueChange={(v) => setValue('gender', v as FormValues['gender'])}>
                <SelectTrigger aria-label="Gender"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Section: Contact */}
          <SectionLabel>Contact Details</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone Number" required error={errors.phone?.message}>
              <Input
                {...register('phone')}
                placeholder="555-0100"
                className={errors.phone ? 'border-destructive/50' : ''}
                aria-invalid={!!errors.phone}
              />
            </FormField>
            <FormField label="Email Address" error={errors.email?.message}>
              <Input
                type="email"
                {...register('email')}
                placeholder="patient@email.com"
                className={errors.email ? 'border-destructive/50' : ''}
                aria-invalid={!!errors.email}
              />
            </FormField>
          </div>

          <FormField label="Address">
            <Input {...register('address')} placeholder="123 Main St, City" />
          </FormField>

          <FormField label="Emergency Contact">
            <Input {...register('emergencyContact')} placeholder="Name — +1 555 0199" />
          </FormField>

          {/* Section: Clinical */}
          <SectionLabel>Clinical Details</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Blood Type">
              <Select value={bloodVal ?? ''} onValueChange={(v) => setValue('bloodType', v)}>
                <SelectTrigger aria-label="Blood type"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Status" required>
              <Select value={statusVal} onValueChange={(v) => setValue('status', v as FormValues['status'])}>
                <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OUTPATIENT">Outpatient</SelectItem>
                  <SelectItem value="ADMITTED">Admitted</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="DISCHARGED">Discharged</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="Assigned Doctor">
            <Select value={doctorVal ?? ''} onValueChange={(v) => setValue('doctorId', v)}>
              <SelectTrigger aria-label="Assigned doctor"><SelectValue placeholder="Select doctor" /></SelectTrigger>
              <SelectContent>
                {doctors?.map((s) => (
                  <SelectItem key={s.userId} value={s.userId}>{s.user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Clinical Notes">
            <Textarea {...register('notes')} rows={3} placeholder="Clinical observations, allergies, current medications..." />
          </FormField>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-9">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-9 gap-2 min-w-[130px]">
              {isSubmitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : isEdit ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />
              }
              {isEdit ? 'Save Changes' : 'Register Patient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 -mb-1">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{children}</p>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}
