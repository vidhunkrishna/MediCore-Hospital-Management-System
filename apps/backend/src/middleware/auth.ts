import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { error } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    error(res, 'Unauthorized', 401);
    return;
  }
  const token = header.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    error(res, 'Invalid or expired token', 401);
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      error(res, 'Forbidden', 403);
      return;
    }
    next();
  };
}
