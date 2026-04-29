export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type PaymentMethod = 'mercadopago' | 'cash';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  is_featured: boolean;
  allergens?: string[];
  preparation_time?: number;
  sort_order: number;
  categories?: Category;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  order_type: OrderType;
  table_number?: string;
  delivery_address?: string;
  delivery_notes?: string;
  order_items?: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  payment_id?: string;
  mp_preference_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  order_type: OrderType;
  table_number?: string;
  delivery_address?: string;
  delivery_notes?: string;
  items: CartItem[];
  payment_method: PaymentMethod;
  notes?: string;
}

export interface BusinessConfig {
  id: string;
  business_name: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
  opening_hours: Record<string, { open: string; close: string; is_open: boolean }>;
  is_open: boolean;
  delivery_available: boolean;
  takeaway_available: boolean;
  dine_in_available: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
