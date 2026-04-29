import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types';
import { sendError } from '../utils/response';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Token de autenticación requerido', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    req.admin = decoded;
    next();
  } catch {
    sendError(res, 'Token inválido o expirado', 401);
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.admin) {
    sendError(res, 'Acceso no autorizado', 403);
    return;
  }

  if (req.admin.role !== 'admin' && req.admin.role !== 'staff') {
    sendError(res, 'Permisos insuficientes', 403);
    return;
  }

  next();
};
