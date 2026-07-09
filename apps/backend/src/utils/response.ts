import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export function success<T>(res: Response, data: T, message?: string, status = 200) {
  const body: ApiResponse<T> = { success: true, data, message };
  return res.status(status).json(body);
}

export function error(res: Response, message: string, status = 400, code?: string) {
  return res.status(status).json({ success: false, error: message, code });
}
