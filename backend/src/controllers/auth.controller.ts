import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../utils/supabase';
import { sendSuccess, sendError } from '../utils/response';
import { LoginRequest } from '../types';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      sendError(res, 'Email y contraseña son requeridos', 400);
      return;
    }

    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !admin) {
      sendError(res, 'Credenciales incorrectas', 401);
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      sendError(res, 'Credenciales incorrectas', 401);
      return;
    }

    const jwtOptions = { expiresIn: process.env.JWT_EXPIRES_IN || '7d' };
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET!,
      jwtOptions as jwt.SignOptions
    );

    const { password_hash: _, ...adminData } = admin;

    sendSuccess(res, { token, admin: adminData }, 'Sesión iniciada correctamente');
  } catch (err) {
    console.error('Error en login:', err);
    sendError(res, 'Error interno del servidor', 500);
  }
};

export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      sendError(res, 'No autorizado', 401);
      return;
    }

    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('id, name, email, role, created_at')
      .eq('id', req.admin.id)
      .single();

    if (error || !admin) {
      sendError(res, 'Admin no encontrado', 404);
      return;
    }

    sendSuccess(res, { admin }, 'Token válido');
  } catch (err) {
    console.error('Error verificando token:', err);
    sendError(res, 'Error interno del servidor', 500);
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      sendError(res, 'Contraseña actual y nueva son requeridas', 400);
      return;
    }

    if (newPassword.length < 8) {
      sendError(res, 'La nueva contraseña debe tener al menos 8 caracteres', 400);
      return;
    }

    const { data: admin } = await supabaseAdmin
      .from('admins')
      .select('password_hash')
      .eq('id', req.admin!.id)
      .single();

    if (!admin) {
      sendError(res, 'Admin no encontrado', 404);
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isValid) {
      sendError(res, 'Contraseña actual incorrecta', 400);
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await supabaseAdmin
      .from('admins')
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq('id', req.admin!.id);

    sendSuccess(res, null, 'Contraseña cambiada correctamente');
  } catch (err) {
    console.error('Error cambiando contraseña:', err);
    sendError(res, 'Error interno del servidor', 500);
  }
};
