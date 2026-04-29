// ========================
// TIPOS GLOBALES
// ========================

export type UserRole = 'admin' | 'staff';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentMethod = 'mercadopago' | 'cash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type ProductCategory = 'cafe' | 'bebidas' | 'comidas' | 'postres' | 'especiales';

// ========================
// MODELOS
// ========================

export interface Admin {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
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
  preparation_time?: number; // minutos
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
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
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  payment_id?: string; // MercadoPago payment ID
  mp_preference_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
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

export interface BusinessConfig {
  id: string;
  business_name: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
  opening_hours: OpeningHours;
  is_open: boolean;
  delivery_available: boolean;
  takeaway_available: boolean;
  dine_in_available: boolean;
  updated_at: string;
}

export interface OpeningHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string; // "09:00"
  close: string; // "23:00"
  is_open: boolean;
}

// ========================
// REQUEST/RESPONSE
// ========================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: Omit<Admin, 'password_hash'>;
}

export interface CreateOrderRequest {
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

export interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

// Express augmentation
declare global {
  namespace Express {
    interface Request {
      admin?: AuthPayload;
    }
  }
}
