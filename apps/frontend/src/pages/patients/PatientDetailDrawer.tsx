import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, MapPin, User, BedDouble, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PatientStatusBadge, AppointmentStatusBadge } from '@/components/shared/StatusBadge';
import { usePatient } from '@/hooks/usePatients';
import { getInitials, getAge, formatDate, formatDateTime } from '@/lib/utils';

interface Props {
  patientId: string | null;
  onClose: () => void;
  onEdit: () => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function PatientDetailDrawer({ patientId, onClose, onEdit }: Props) {
  const { data: patient, isLoading } = usePatient(patientId);

  return (
    <AnimatePresence>
      {patientId && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-card border-l border-border flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
              <h2 className="font-semibold text-base">Patient Details</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-3.5 w-24" />
                    </div>
                  </div>
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
                </div>
              ) : patient ? (
                <>
                  {/* Identity */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="text-lg">{getInitials(`${patient.firstName} ${patient.lastName}`)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold">{patient.firstName} {patient.lastName}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">{patient.mrn}</Badge>
                        <PatientStatusBadge status={patient.status} />
                        {patient.bloodType && <Badge variant="secondary">{patient.bloodType}</Badge>}
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Age', value: `${getAge(patient.dob)}y` },
                      { label: 'Gender', value: patient.gender },
                      { label: 'Blood', value: patient.bloodType ?? '—' },
                    ].map((s) => (
                      <div key={s.label} className="bg-secondary/40 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Contact info */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact</p>
                    <InfoRow icon={Phone} label="Phone" value={patient.phone} />
                    <InfoRow icon={Mail} label="Email" value={patient.email} />
                    <InfoRow icon={MapPin} label="Address" value={patient.address} />
                    <InfoRow icon={AlertTriangle} label="Emergency Contact" value={patient.emergencyContact} />
                  </div>

                  {/* Clinical */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Clinical</p>
                    <InfoRow icon={User} label="Assigned Doctor" value={patient.doctor?.name} />
                    <InfoRow icon={BedDouble} label="Bed" value={patient.bed ? `${patient.bed.number} — ${patient.bed.ward?.name}` : null} />
                    <InfoRow icon={Calendar} label="Admitted" value={patient.admittedAt ? formatDate(patient.admittedAt) : null} />
                    <InfoRow icon={Calendar} label="Discharged" value={patient.dischargedAt ? formatDate(patient.dischargedAt) : null} />
                    {patient.notes && (
                      <div className="bg-secondary/40 rounded-xl p-3">
                        <p className="text-[11px] text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm">{patient.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Recent appointments */}
                  {!!patient.appointments?.length && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Recent Appointments ({patient.appointments.length})
                      </p>
                      {patient.appointments.slice(0, 5).map((a) => (
                        <div key={a.id} className="flex items-center justify-between bg-secondary/40 rounded-xl p-3">
                          <div>
                            <p className="text-xs font-medium">{a.type.replace('_', ' ')}</p>
                            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span className="text-[11px]">{formatDateTime(a.scheduledAt)}</span>
                            </div>
                          </div>
                          <AppointmentStatusBadge status={a.status} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-muted-foreground text-right">
                    Registered {formatDate(patient.createdAt)}
                  </div>
                </>
              ) : null}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
