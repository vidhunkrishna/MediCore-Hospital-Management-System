import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { success, error } from '../utils/response.js';
import { pid } from '../utils/params.js';

const prisma = new PrismaClient();

export async function getAppointments(req: Request, res: Response) {
  const { doctorId, status, date, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: Record<string, unknown> = {};
  if (doctorId) where.doctorId = doctorId;
  if (status) where.status = status;
  if (date) {
    const d = new Date(date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    where.scheduledAt = { gte: d, lt: next };
  }
  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { scheduledAt: 'asc' },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
        doctor: { select: { id: true, name: true } },
        department: true,
      },
    }),
    prisma.appointment.count({ where }),
  ]);
  res.json({ success: true, data: appointments, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
}

export async function getAppointment(req: Request, res: Response) {
  const appt = await prisma.appointment.findUnique({
    where: { id: pid(req.params.id) },
    include: {
      patient: true,
      doctor: { select: { id: true, name: true } },
      department: true,
    },
  });
  if (!appt) { error(res, 'Appointment not found', 404); return; }
  success(res, appt);
}

export async function createAppointment(req: Request, res: Response) {
  const { scheduledAt, doctorId, duration = 30, ...rest } = req.body;
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + duration * 60000);
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId,
      status: { notIn: ['CANCELLED', 'COMPLETED'] },
      scheduledAt: { lt: end },
      AND: [{ scheduledAt: { gte: new Date(start.getTime() - duration * 60000) } }],
    },
  });
  if (conflict) { error(res, 'Doctor has a conflicting appointment at this time', 409); return; }
  const appt = await prisma.appointment.create({
    data: { ...rest, doctorId, scheduledAt: start, duration },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
      doctor: { select: { id: true, name: true } },
      department: true,
    },
  });
  success(res, appt, 'Appointment created', 201);
}

export async function updateAppointment(req: Request, res: Response) {
  const { scheduledAt, ...rest } = req.body;
  const data: Record<string, unknown> = { ...rest };
  if (scheduledAt) data.scheduledAt = new Date(scheduledAt);
  const appt = await prisma.appointment.update({ where: { id: pid(req.params.id) }, data });
  success(res, appt);
}

export async function updateAppointmentStatus(req: Request, res: Response) {
  const { status } = req.body;
  const appt = await prisma.appointment.update({ where: { id: pid(req.params.id) }, data: { status } });
  success(res, appt);
}
