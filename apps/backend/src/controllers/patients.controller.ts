import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { success, error } from '../utils/response.js';
import { pid } from '../utils/params.js';

const prisma = new PrismaClient();

export async function getPatients(req: Request, res: Response) {
  const { q, status, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { mrn: { contains: q } },
      { phone: { contains: q } },
    ];
  }
  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { doctor: { select: { id: true, name: true } }, bed: true },
    }),
    prisma.patient.count({ where }),
  ]);
  res.json({ success: true, data: patients, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
}

export async function getPatient(req: Request, res: Response) {
  const patient = await prisma.patient.findUnique({
    where: { id: pid(req.params.id) },
    include: {
      doctor: { select: { id: true, name: true, role: true } },
      bed: { include: { ward: { include: { department: true } } } },
      appointments: {
        orderBy: { scheduledAt: 'desc' },
        take: 10,
        include: { doctor: { select: { id: true, name: true } }, department: true },
      },
    },
  });
  if (!patient) { error(res, 'Patient not found', 404); return; }
  success(res, patient);
}

export async function createPatient(req: Request, res: Response) {
  const { dob, ...rest } = req.body;
  const mrn = `MRN-${Date.now().toString().slice(-6)}`;
  const patient = await prisma.patient.create({
    data: { ...rest, mrn, dob: new Date(dob) },
  });
  success(res, patient, 'Patient created', 201);
}

export async function updatePatient(req: Request, res: Response) {
  const { dob, ...rest } = req.body;
  const data: Record<string, unknown> = { ...rest };
  if (dob) data.dob = new Date(dob);
  const patient = await prisma.patient.update({ where: { id: pid(req.params.id) }, data });
  success(res, patient);
}

export async function admitPatient(req: Request, res: Response) {
  const { bedId, doctorId } = req.body;
  const [patient] = await Promise.all([
    prisma.patient.update({
      where: { id: pid(req.params.id) },
      data: { status: 'ADMITTED', bedId, doctorId, admittedAt: new Date() },
    }),
    bedId ? prisma.bed.update({ where: { id: bedId }, data: { status: 'OCCUPIED' } }) : Promise.resolve(),
  ]);
  success(res, patient);
}

export async function dischargePatient(req: Request, res: Response) {
  const patient = await prisma.patient.findUnique({ where: { id: pid(req.params.id) } });
  if (!patient) { error(res, 'Patient not found', 404); return; }
  await Promise.all([
    prisma.patient.update({
      where: { id: pid(req.params.id) },
      data: { status: 'DISCHARGED', dischargedAt: new Date(), bedId: null },
    }),
    patient.bedId ? prisma.bed.update({ where: { id: patient.bedId }, data: { status: 'AVAILABLE' } }) : Promise.resolve(),
  ]);
  success(res, null, 'Patient discharged');
}
