import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateAppointment, useUpdateAppointment, type AppointmentFormData } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { useDoctors } from '@/hooks/useDoctors';
import { useDepartments } from '@/hooks/useDepartments';
import { useUIStore } from '@/store/ui.store';
import type { Appointment } from '@/types';

const schema = z.object({
  patientId: z.string().min(1, 'Required'),
  doctorId: z.string().min(1, 'Required'),
  departmentId: z.string().min(1, 'Required'),
  scheduledAt: z.string().min(1, 'Required'),
  duration: z.coerce.number().min(5).max(240),
  type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'PROCEDURE', 'EMERGENCY']),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
}

export function AppointmentModal({ open, onClose, appointment }: Props) {
  const addToast = useUIStore((s) => s.addToast);
  const { data: patientsData } = usePatients({ limit: 100 });
  const { data: doctors } = useDoctors();
  const { data: departments } = useDepartments();
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment(appointment?.id ?? '');
  const isEdit = !!appointment;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { duration: 30, type: 'CONSULTATION' },
  });

  useEffect(() => {
    if (appointment) {
      reset({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        departmentId: appointment.departmentId,
        scheduledAt: appointment.scheduledAt?.slice(0, 16),
        duration: appointment.duration,
        type: appointment.type as FormValues['type'],
        notes: appointment.notes ?? '',
      });
    } else {
      reset({ duration: 30, type: 'CONSULTATION' });
    }
  }, [appointment, reset]);

  const onSubmit = async (data: FormValues) => {
    const payload: AppointmentFormData = { ...data, scheduledAt: new Date(data.scheduledAt).toISOString() };
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
      addToast({ title: 'Error', description: 'Could not save appointment', variant: 'destructive' });
    }
  };

  const typeVal = watch('type');
  const patientVal = watch('patientId');
  const doctorVal = watch('doctorId');
  const deptVal = watch('departmentId');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Appointment' : 'Schedule Appointment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Patient *</Label>
            <Select value={patientVal} onValueChange={(v) => setValue('patientId', v)}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>
                {patientsData?.data.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.mrn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.patientId && <p className="text-xs text-red-400">{errors.patientId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Doctor *</Label>
              <Select value={doctorVal} onValueChange={(v) => setValue('doctorId', v)}>
                <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {doctors?.map((s) => (
                    <SelectItem key={s.userId} value={s.userId}>{s.user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.doctorId && <p className="text-xs text-red-400">{errors.doctorId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Department *</Label>
              <Select value={deptVal} onValueChange={(v) => setValue('departmentId', v)}>
                <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                <SelectContent>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departmentId && <p className="text-xs text-red-400">{errors.departmentId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date & Time *</Label>
              <Input type="datetime-local" {...register('scheduledAt')} />
              {errors.scheduledAt && <p className="text-xs text-red-400">{errors.scheduledAt.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input type="number" min={5} max={240} {...register('duration')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Type *</Label>
            <Select value={typeVal} onValueChange={(v) => setValue('type', v as FormValues['type'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CONSULTATION">Consultation</SelectItem>
                <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                <SelectItem value="PROCEDURE">Procedure</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Additional notes..."
              className="flex w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
