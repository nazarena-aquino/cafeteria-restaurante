import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { sendSuccess, sendError, generateOrderNumber } from '../utils/response';
import { CreateOrderRequest } from '../types';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderData: CreateOrderRequest = req.body;

    // Validaciones básicas
    if (!orderData.items || orderData.items.length === 0) {
      sendError(res, 'El pedido debe tener al menos un producto', 400);
      return;
    }

    if (!orderData.order_type) {
      sendError(res, 'Tipo de pedido requerido (dine_in, takeaway, delivery)', 400);
      return;
    }

    if (orderData.order_type === 'delivery' && !orderData.delivery_address) {
      sendError(res, 'Dirección de entrega requerida para pedidos con envío', 400);
      return;
    }

    if (orderData.order_type === 'dine_in' && !orderData.table_number) {
      sendError(res, 'Número de mesa requerido para consumo en el local', 400);
      return;
    }

    // Verificar productos y calcular precios desde la base de datos
    const productIds = orderData.items.map(i => i.product_id);
    const { data: products, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name, price, is_available')
      .in('id', productIds);

    if (productError || !products) {
      sendError(res, 'Error verificando productos', 500);
      return;
    }

    // Verificar disponibilidad y calcular total
    const productMap = new Map(products.map(p => [p.id, p]));
    let subtotal = 0;
    const orderItems = [];

    for (const item of orderData.items) {
      const product = productMap.get(item.product_id);

      if (!product) {
        sendError(res, `Producto no encontrado: ${item.product_id}`, 400);
        return;
      }

      if (!product.is_available) {
        sendError(res, `El producto "${product.name}" no está disponible`, 400);
        return;
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product_id: item.product_id,
        product_name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        notes: item.notes || null,
      });
    }

    const total = subtotal; // El envío se coordina por fuera

    const orderNumber = generateOrderNumber();

    // Crear el pedido
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: orderData.customer_name || null,
        customer_phone: orderData.customer_phone || null,
        customer_email: orderData.customer_email || null,
        order_type: orderData.order_type,
        table_number: orderData.table_number || null,
        delivery_address: orderData.delivery_address || null,
        delivery_notes: orderData.delivery_notes || null,
        subtotal,
        total,
        status: 'pending',
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_method === 'cash' ? 'pending' : 'pending',
        notes: orderData.notes || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creando orden:', orderError);
      sendError(res, 'Error creando el pedido', 500);
      return;
    }

    // Insertar items del pedido
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error('Error insertando items:', itemsError);
      // Revertir el pedido si hay error en items
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      sendError(res, 'Error procesando los items del pedido', 500);
      return;
    }

    // Obtener el pedido completo
    const { data: completeOrder } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order.id)
      .single();

    sendSuccess(res, completeOrder, 'Pedido creado exitosamente', 201);
  } catch (err) {
    console.error('Error en createOrder:', err);
    sendError(res, 'Error interno del servidor', 500);
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, order_type, date, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (status) query = query.eq('status', status as string);
    if (order_type) query = query.eq('order_type', order_type as string);
    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      query = query.gte('created_at', startDate.toISOString())
                   .lte('created_at', endDate.toISOString());
    }

    const { data, error, count } = await query;
    if (error) throw error;

    sendSuccess(res, {
      orders: data || [],
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });
  } catch (err) {
    sendError(res, 'Error obteniendo pedidos', 500);
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      sendError(res, 'Pedido no encontrado', 404);
      return;
    }

    sendSuccess(res, data);
  } catch (err) {
    sendError(res, 'Error obteniendo pedido', 500);
  }
};

export const getOrderByNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNumber } = req.params;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNumber)
      .single();

    if (error || !data) {
      sendError(res, 'Pedido no encontrado', 404);
      return;
    }

    sendSuccess(res, data);
  } catch (err) {
    sendError(res, 'Error obteniendo pedido', 500);
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      sendError(res, 'Estado inválido', 400);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, order_items(*)')
      .single();

    if (error) throw error;
    sendSuccess(res, data, `Estado actualizado a: ${status}`);
  } catch (err) {
    sendError(res, 'Error actualizando estado del pedido', 500);
  }
};

export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { payment_status, payment_id } = req.body;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status,
        payment_id: payment_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    sendSuccess(res, data, 'Pago actualizado');
  } catch (err) {
    sendError(res, 'Error actualizando pago', 500);
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // Pedidos de hoy
    const { data: todayOrders } = await supabaseAdmin
      .from('orders')
      .select('total, status, payment_status')
      .gte('created_at', todayStr);

    // Pedidos pendientes
    const { count: pendingCount } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed', 'preparing']);

    // Total del día
    const todayRevenue = (todayOrders || [])
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total, 0);

    const todayOrdersCount = (todayOrders || []).length;

    // Pedidos de los últimos 7 días para gráfico
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: weekOrders } = await supabaseAdmin
      .from('orders')
      .select('created_at, total, status')
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: true });

    // Productos más pedidos
    const { data: topProducts } = await supabaseAdmin
      .from('order_items')
      .select('product_name, quantity')
      .limit(100);

    const productCounts: Record<string, number> = {};
    (topProducts || []).forEach(item => {
      productCounts[item.product_name] = (productCounts[item.product_name] || 0) + item.quantity;
    });

    const topProductsList = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    sendSuccess(res, {
      today: {
        orders: todayOrdersCount,
        revenue: todayRevenue,
      },
      pending: pendingCount || 0,
      weekOrders: weekOrders || [],
      topProducts: topProductsList,
    });
  } catch (err) {
    console.error('Error en dashboard:', err);
    sendError(res, 'Error obteniendo estadísticas', 500);
  }
};
