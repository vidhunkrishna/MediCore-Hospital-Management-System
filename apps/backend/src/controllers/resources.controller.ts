import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { success } from '../utils/response.js';
import { pid } from '../utils/params.js';

const prisma = new PrismaClient();

export async function getBeds(req: Request, res: Response) {
  const beds = await prisma.bed.findMany({
    include: {
      ward: { include: { department: true } },
      patients: { where: { status: 'ADMITTED' }, select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: [{ ward: { name: 'asc' } }, { number: 'asc' }],
  });
  success(res, beds);
}

export async function updateBedStatus(req: Request, res: Response) {
  const bed = await prisma.bed.update({ where: { id: pid(req.params.id) }, data: { status: req.body.status } });
  success(res, bed);
}

export async function getEquipment(req: Request, res: Response) {
  const equipment = await prisma.equipment.findMany({
    include: { department: true },
    orderBy: { name: 'asc' },
  });
  success(res, equipment);
}

export async function updateEquipment(req: Request, res: Response) {
  const equipment = await prisma.equipment.update({ where: { id: pid(req.params.id) }, data: req.body });
  success(res, equipment);
}

export async function getStaff(req: Request, res: Response) {
  const staff = await prisma.staff.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, role: true, avatar: true } },
      department: true,
    },
  });
  success(res, staff);
}

export async function updateStaffAvailability(req: Request, res: Response) {
  const staff = await prisma.staff.update({ where: { id: pid(req.params.id) }, data: { available: req.body.available } });
  success(res, staff);
}
