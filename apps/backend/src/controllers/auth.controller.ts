import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { signToken } from '../utils/jwt.js';
import { success, error } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']).optional(),
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    error(res, 'Invalid credentials format', 422);
    return;
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    error(res, 'Invalid email or password', 401);
    return;
  }
  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  success(res, { token, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar } });
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    error(res, parsed.error.errors.map((e) => e.message).join(', '), 422);
    return;
  }
  const { email, password, name, role } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    error(res, 'Email already in use', 409);
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed, name, role: role ?? 'RECEPTIONIST' },
  });
  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  success(res, { token, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar } }, 'Account created', 201);
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.user) {
    error(res, 'Unauthorized', 401);
    return;
  }
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
  });
  if (!user) {
    error(res, 'User not found', 404);
    return;
  }
  success(res, user);
}
