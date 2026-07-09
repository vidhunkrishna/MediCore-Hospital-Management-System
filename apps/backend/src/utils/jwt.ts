import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types/index.js';

const SECRET = process.env.JWT_SECRET ?? 'fallback-secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, SECRET) as AuthPayload;
}
