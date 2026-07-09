import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CalendarPlus, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, Textarea } from '@/components/shared/FormField';
import { useCreateAppointment, useUpdateAppointment, type AppointmentFormData } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { useDoctors } from '@/hooks/useDoctors';
import { useDepartments } from '@/hooks/useDepartments';
import { useUIStore } from '@/store/ui.store';
import type { Appointment } from '@/types';

const schema = z.object({
  patientId:    z.string().min(1, 'Select a patient'),
  doctorId:     z.string().min(1, 'Select a doctor'),
  departmentId: z.string().min(1, 'Select a department'),
  scheduledAt:  z.string().min(1, 'Date and time required'),
  duration:     z.coerce.number().min(5, 'Min 5 min').max(240, 'Max 240 min'),
  type:         z.enum(['CONSULTATION', 'FOLLOW_UP', 'PROCEDURE', 'EMERGENCY']),
  notes:        z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
}

export function AppointmentModal({ open, onClose, appointment }: Props) {
  const addToast          = useUIStore((s) => s.addToast);
  const { data: patientsData } = usePatients({ limit: 100 });
  const { data: doctors }      = useDoctors();
  const { data: departments }  = useDepartments();
  const createMutation         = useCreateAppointment();
  const updateMutation         = useUpdateAppointment(appointment?.id ?? '');
  const isEdit                 = !!appointment;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { duration: 30, type: 'CONSULTATION' },
    });

  useEffect(() => {
    if (appointment) {
      reset({
        patientId:    appointment.patientId,
        doctorId:     appointment.doctorId,
        departmentId: appointment.departmentId,
        scheduledAt:  appointment.scheduledAt?.slice(0, 16),
        duration:     appointment.duration,
        type:         appointment.type as FormValues['type'],
        notes:        appointment.notes ?? '',
      });
    } else {
      reset({ duration: 30, type: 'CONSULTATION' });
    }
  }, [appointment, reset]);

  const onSubmit = async (data: FormValues) => {
    const payload: AppointmentFormData = {
      ...data,
      scheduledAt: new Date(data.scheduledAt).toISOString(),
    };
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload);
        addToast({ title: 'Appointment updated', variant: 'success' });
      } else {
        await createMutation.mutateAsync(payload);
        addToast({ title: 'Appointment scheduled', variant: 'success' });
      }
      onClose();
    } catch {
      addToast({ title: 'Error saving appointment', description: 'Please try again', variant: 'destructive' });
    }
  };

  const typeVal    = watch('type');
  const patientVal = watch('patientId');
  const doctorVal  = watch('doctorId');
  const deptVal    = watch('departmentId');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
              {isEdit ? <Save className="w-4 h-4 text-white" /> : <CalendarPlus className="w-4 h-4 text-white" />}
            </div>
            <DialogTitle className="text-base font-semibold">
              {isEdit ? 'Edit Appointment' : 'Schedule Appointment'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <FormField label="Patient" required error={errors.patientId?.message}>
            <Select value={patientVal} onValueChange={(v) => setValue('patientId', v)}>
              <SelectTrigger aria-label="Patient" className={errors.patientId ? 'border-destructive/50' : ''}>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patientsData?.data.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} — {p.mrn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Doctor" required error={errors.doctorId?.message}>
              <Select value={doctorVal} onValueChange={(v) => setValue('doctorId', v)}>
                <SelectTrigger aria-label="Doctor" className={errors.doctorId ? 'border-destructive/50' : ''}>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors?.map((s) => (
                    <SelectItem key={s.userId} value={s.userId}>{s.user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Department" required error={errors.departmentId?.message}>
              <Select value={deptVal} onValueChange={(v) => setValue('departmentId', v)}>
                <SelectTrigger aria-label="Department" className={errors.departmentId ? 'border-destructive/50' : ''}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date & Time" required error={errors.scheduledAt?.message}>
              <Input
                type="datetime-local"
                {...register('scheduledAt')}
                className={errors.scheduledAt ? 'border-destructive/50' : ''}
                aria-invalid={!!errors.scheduledAt}
              />
            </FormField>
            <FormField label="Duration (minutes)" error={errors.duration?.message}>
              <Input
                type="number"
                min={5}
                max={240}
                {...register('duration')}
                className={errors.duration ? 'border-destructive/50' : ''}
              />
            </FormField>
          </div>

          <FormField label="Appointment Type" required>
            <Select value={typeVal} onValueChange={(v) => setValue('type', v as FormValues['type'])}>
              <SelectTrigger aria-label="Appointment type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CONSULTATION">Consultation</SelectItem>
                <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                <SelectItem value="PROCEDURE">Procedure</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Notes">
            <Textarea
              {...register('notes')}
              rows={2}
              placeholder="Additional notes or instructions..."
            />
          </FormField>

          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="h-9">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-9 gap-2 min-w-[120px]">
              {isSubmitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : isEdit ? <Save className="w-4 h-4" /> : <CalendarPlus className="w-4 h-4" />
              }
              {isEdit ? 'Save Changes' : 'Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
