import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { success } from '../utils/response.js';
import { pid } from '../utils/params.js';

const prisma = new PrismaClient();

export async function getOverview(_req: Request, res: Response) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalPatients,
    admittedPatients,
    criticalPatients,
    todayAppointments,
    totalBeds,
    occupiedBeds,
    activeAlerts,
    totalDoctors,
  ] = await Promise.all([
    prisma.patient.count({ where: { status: { not: 'DISCHARGED' } } }),
    prisma.patient.count({ where: { status: 'ADMITTED' } }),
    prisma.patient.count({ where: { status: 'CRITICAL' } }),
    prisma.appointment.count({ where: { scheduledAt: { gte: today, lt: tomorrow } } }),
    prisma.bed.count(),
    prisma.bed.count({ where: { status: 'OCCUPIED' } }),
    prisma.alert.count({ where: { resolved: false } }),
    prisma.user.count({ where: { role: 'DOCTOR' } }),
  ]);

  success(res, {
    totalPatients,
    admittedPatients,
    criticalPatients,
    todayAppointments,
    totalBeds,
    occupiedBeds,
    occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
    activeAlerts,
    totalDoctors,
  });
}

export async function getOccupancyTrend(_req: Request, res: Response) {
  const data = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      date: d.toISOString().slice(0, 10),
      occupancy: Math.floor(Math.random() * 30) + 55,
      admissions: Math.floor(Math.random() * 15) + 5,
      discharges: Math.floor(Math.random() * 12) + 4,
    };
  });
  success(res, data);
}

export async function getAppointmentVolume(_req: Request, res: Response) {
  const departments = await prisma.department.findMany({ select: { id: true, name: true } });
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = days.map((day) => {
    const entry: Record<string, unknown> = { day };
    departments.forEach((d) => { entry[d.name] = Math.floor(Math.random() * 20) + 5; });
    return entry;
  });
  success(res, { data, departments: departments.map((d) => d.name) });
}

export async function getDepartmentLoad(_req: Request, res: Response) {
  const departments = await prisma.department.findMany({
    include: { _count: { select: { appointments: true, staff: true, equipment: true } } },
  });
  const data = departments.map((d) => ({
    department: d.name,
    patients: Math.floor(Math.random() * 40) + 10,
    staff: d._count.staff,
    equipment: d._count.equipment,
    appointments: d._count.appointments,
    load: Math.floor(Math.random() * 40) + 50,
  }));
  success(res, data);
}

export async function getAlerts(_req: Request, res: Response) {
  const alerts = await prisma.alert.findMany({ where: { resolved: false }, orderBy: { createdAt: 'desc' } });
  success(res, alerts);
}

export async function resolveAlert(req: Request, res: Response) {
  const alert = await prisma.alert.update({ where: { id: pid(req.params.id) }, data: { resolved: true } });
  success(res, alert);
}
