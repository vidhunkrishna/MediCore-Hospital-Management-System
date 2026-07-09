export type Role = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';
export type PatientStatus = 'ADMITTED' | 'OUTPATIENT' | 'CRITICAL' | 'DISCHARGED';
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type AppointmentType = 'CONSULTATION' | 'FOLLOW_UP' | 'PROCEDURE' | 'EMERGENCY';
export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
export type EquipmentStatus = 'OPERATIONAL' | 'MAINTENANCE' | 'RETIRED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  createdAt?: string;
}

export interface Department {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  color: string;
}

export interface Bed {
  id: string;
  number: string;
  wardId: string;
  status: BedStatus;
  type: string;
  ward?: { id: string; name: string; department: Department };
  patients?: Pick<Patient, 'id' | 'firstName' | 'lastName'>[];
}

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  bloodType?: string;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  status: PatientStatus;
  doctorId?: string;
  doctor?: Pick<User, 'id' | 'name'>;
  bedId?: string;
  bed?: Bed;
  admittedAt?: string;
  dischargedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  appointments?: Appointment[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patient?: Pick<Patient, 'id' | 'firstName' | 'lastName' | 'mrn'>;
  doctorId: string;
  doctor?: Pick<User, 'id' | 'name'>;
  departmentId: string;
  department?: Department;
  scheduledAt: string;
  duration: number;
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  serialNo: string;
  status: EquipmentStatus;
  departmentId: string;
  department?: Department;
  lastServiced?: string;
  nextService?: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  userId: string;
  user: User;
  departmentId: string;
  department: Department;
  shift: string;
  available: boolean;
}

export interface Alert {
  id: string;
  type: string;
  severity: AlertSeverity;
  message: string;
  resourceType?: string;
  resourceId?: string;
  resolved: boolean;
  createdAt: string;
}

export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: ApiMeta;
}

export interface AnalyticsOverview {
  totalPatients: number;
  admittedPatients: number;
  criticalPatients: number;
  todayAppointments: number;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  activeAlerts: number;
  totalDoctors: number;
}

export interface AIHealthScore {
  score: number;
  occupancyRate: number;
  staffUtilization: number;
  criticalPatients: number;
  unresolvedAlerts: number;
}

export interface AIInsight {
  id: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  action: string;
}

export interface AIRecommendation {
  id: string;
  category: string;
  icon: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  impact: string;
}
