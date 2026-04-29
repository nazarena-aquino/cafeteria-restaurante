import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { sendSuccess, sendError } from '../utils/response';

export const getBusinessConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('business_config')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    sendSuccess(res, data || null);
  } catch (err) {
    sendError(res, 'Error obteniendo configuración', 500);
  }
};

export const updateBusinessConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data: existing } = await supabaseAdmin
      .from('business_config')
      .select('id')
      .single();

    let result;
    if (existing) {
      result = await supabaseAdmin
        .from('business_config')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('business_config')
        .insert(updates)
        .select()
        .single();
    }

    if (result.error) throw result.error;
    sendSuccess(res, result.data, 'Configuración actualizada');
  } catch (err) {
    console.error('Error actualizando configuración:', err);
    sendError(res, 'Error actualizando configuración', 500);
  }
};

export const toggleBusinessOpen = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: config } = await supabaseAdmin
      .from('business_config')
      .select('id, is_open')
      .single();

    if (!config) {
      sendError(res, 'Configuración no encontrada', 404);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('business_config')
      .update({ is_open: !config.is_open, updated_at: new Date().toISOString() })
      .eq('id', config.id)
      .select()
      .single();

    if (error) throw error;
    sendSuccess(res, data, `Local ${data.is_open ? 'abierto' : 'cerrado'}`);
  } catch (err) {
    sendError(res, 'Error cambiando estado del local', 500);
  }
};

export const getMPPublicKey = async (req: Request, res: Response): Promise<void> => {
  const publicKey = process.env.MP_PUBLIC_KEY;
  if (!publicKey) {
    sendError(res, 'MercadoPago no configurado', 500);
    return;
  }
  sendSuccess(res, { public_key: publicKey });
};
