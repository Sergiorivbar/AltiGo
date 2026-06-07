import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/app-error';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.code, message: err.message });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Ha ocurrido un error inesperado' });
}
