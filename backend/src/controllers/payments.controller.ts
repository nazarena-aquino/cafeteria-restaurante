import { Request, Response } from 'express';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { supabaseAdmin } from '../utils/supabase';
import { sendSuccess, sendError } from '../utils/response';

const getMPClient = () => {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('MP_ACCESS_TOKEN no configurado');
  return new MercadoPagoConfig({ accessToken: token });
};

export const createPreference = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      sendError(res, 'order_id es requerido', 400);
      return;
    }

    // Obtener el pedido
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order_id)
      .single();

    if (error || !order) {
      sendError(res, 'Pedido no encontrado', 404);
      return;
    }

    if (order.payment_status === 'paid') {
      sendError(res, 'Este pedido ya fue pagado', 400);
      return;
    }

    const client = getMPClient();
    const preference = new Preference(client);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const items = order.order_items.map((item: any) => ({
      id: item.product_id,
      title: item.product_name,
      quantity: item.quantity,
      unit_price: Number(item.price),
      currency_id: 'ARS',
    }));

    const preferenceData = {
      items,
      payer: {
        name: order.customer_name || 'Cliente',
        email: order.customer_email || 'cliente@cafeteria.com',
      },
      external_reference: order.id,
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payments/webhook`,
      back_urls: {
        success: `${frontendUrl}/order-status/${order.order_number}?payment=success`,
        failure: `${frontendUrl}/order-status/${order.order_number}?payment=failure`,
        pending: `${frontendUrl}/order-status/${order.order_number}?payment=pending`,
      },
      // auto_return solo en producción
      ...(process.env.NODE_ENV === 'production' && { auto_return: 'approved' as const }),
      statement_descriptor: process.env.BUSINESS_NAME || 'Cafetería',
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
      },
    }

    const result = await preference.create({ body: preferenceData });

    // Guardar el preference ID en el pedido
    await supabaseAdmin
      .from('orders')
      .update({
        mp_preference_id: result.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    sendSuccess(res, {
      preference_id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });
  } catch (err: any) {
    console.error('Error creando preferencia MP:', err);
    sendError(res, `Error creando preferencia de pago: ${err.message}`, 500);
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, data } = req.body;

    console.log('📩 Webhook MP recibido:', { type, data });

    if (type === 'payment') {
      const paymentId = data?.id;

      if (!paymentId) {
        res.status(200).json({ received: true });
        return;
      }

      const client = getMPClient();
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id: paymentId });

      const orderId = payment.external_reference;

      if (!orderId) {
        res.status(200).json({ received: true });
        return;
      }

      let paymentStatus: string;
      let orderStatus: string | undefined;

      switch (payment.status) {
        case 'approved':
          paymentStatus = 'paid';
          orderStatus = 'confirmed';
          break;
        case 'rejected':
        case 'cancelled':
          paymentStatus = 'failed';
          break;
        case 'refunded':
          paymentStatus = 'refunded';
          orderStatus = 'cancelled';
          break;
        default:
          paymentStatus = 'pending';
      }

      const updateData: any = {
        payment_status: paymentStatus,
        payment_id: String(paymentId),
        updated_at: new Date().toISOString(),
      };

      if (orderStatus) {
        updateData.status = orderStatus;
      }

      await supabaseAdmin
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      console.log(`✅ Orden ${orderId} actualizada: pago=${paymentStatus}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error procesando webhook:', err);
    res.status(200).json({ received: true }); // Siempre responder 200 a MP
  }
};

export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payment_id } = req.params;

    const client = getMPClient();
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: Number(payment_id) });

    sendSuccess(res, {
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      amount: payment.transaction_amount,
      date_approved: payment.date_approved,
    });
  } catch (err) {
    sendError(res, 'Error obteniendo estado del pago', 500);
  }
};

export const confirmCashPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order_id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .eq('payment_method', 'cash')
      .select()
      .single();

    if (error || !data) {
      sendError(res, 'Pedido no encontrado o no es pago en efectivo', 400);
      return;
    }

    sendSuccess(res, data, 'Pago en efectivo confirmado');
  } catch (err) {
    sendError(res, 'Error confirmando pago', 500);
  }
};
