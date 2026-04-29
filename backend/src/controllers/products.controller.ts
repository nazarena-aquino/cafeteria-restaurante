import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { sendSuccess, sendError } from '../utils/response';

// ==================== CATEGORÍAS ====================

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    sendSuccess(res, data || []);
  } catch (err) {
    console.error('Error obteniendo categorías:', err);
    sendError(res, 'Error obteniendo categorías', 500);
  }
};

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    sendSuccess(res, data || []);
  } catch (err) {
    sendError(res, 'Error obteniendo categorías', 500);
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, image_url, sort_order } = req.body;

    if (!name) {
      sendError(res, 'El nombre es requerido', 400);
      return;
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ name, slug, description, image_url, sort_order: sort_order || 0, is_active: true })
      .select()
      .single();

    if (error) throw error;
    sendSuccess(res, data, 'Categoría creada', 201);
  } catch (err) {
    console.error('Error creando categoría:', err);
    sendError(res, 'Error creando categoría', 500);
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    sendSuccess(res, data, 'Categoría actualizada');
  } catch (err) {
    sendError(res, 'Error actualizando categoría', 500);
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    sendSuccess(res, null, 'Categoría eliminada');
  } catch (err) {
    sendError(res, 'Error eliminando categoría', 500);
  }
};

// ==================== PRODUCTOS ====================

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category_id, featured } = req.query;

    let query = supabaseAdmin
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('is_available', true)
      .order('sort_order', { ascending: true });

    if (category_id) {
      query = query.eq('category_id', category_id as string);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    sendSuccess(res, data || []);
  } catch (err) {
    console.error('Error obteniendo productos:', err);
    sendError(res, 'Error obteniendo productos', 500);
  }
};

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, categories(id, name, slug)')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    sendSuccess(res, data || []);
  } catch (err) {
    sendError(res, 'Error obteniendo productos', 500);
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('id', id)
      .single();

    if (error || !data) {
      sendError(res, 'Producto no encontrado', 404);
      return;
    }

    sendSuccess(res, data);
  } catch (err) {
    sendError(res, 'Error obteniendo producto', 500);
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category_id, name, description, price, image_url,
      is_available, is_featured, allergens, preparation_time, sort_order
    } = req.body;

    if (!name || !price || !category_id) {
      sendError(res, 'Nombre, precio y categoría son requeridos', 400);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        category_id, name, description, price: Number(price),
        image_url, is_available: is_available ?? true,
        is_featured: is_featured ?? false,
        allergens: allergens || [],
        preparation_time, sort_order: sort_order || 0,
      })
      .select('*, categories(id, name, slug)')
      .single();

    if (error) throw error;
    sendSuccess(res, data, 'Producto creado', 201);
  } catch (err) {
    console.error('Error creando producto:', err);
    sendError(res, 'Error creando producto', 500);
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    if (updates.price) updates.price = Number(updates.price);

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('*, categories(id, name, slug)')
      .single();

    if (error) throw error;
    sendSuccess(res, data, 'Producto actualizado');
  } catch (err) {
    sendError(res, 'Error actualizando producto', 500);
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('products')
      .update({ is_available: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    sendSuccess(res, null, 'Producto eliminado');
  } catch (err) {
    sendError(res, 'Error eliminando producto', 500);
  }
};

export const toggleProductAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: product } = await supabaseAdmin
      .from('products')
      .select('is_available')
      .eq('id', id)
      .single();

    if (!product) {
      sendError(res, 'Producto no encontrado', 404);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ is_available: !product.is_available, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    sendSuccess(res, data, `Producto ${data.is_available ? 'habilitado' : 'deshabilitado'}`);
  } catch (err) {
    sendError(res, 'Error cambiando disponibilidad', 500);
  }
};
