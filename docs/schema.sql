-- ============================================
-- SCHEMA DE BASE DE DATOS - CAFETERÍA/BAR
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================
-- TABLA: admins
-- ========================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================
-- TABLA: categories
-- ========================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================
-- TABLA: products
-- ========================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  allergens TEXT[] DEFAULT '{}',
  preparation_time INTEGER, -- minutos estimados
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================
-- TABLA: orders
-- ========================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
  table_number VARCHAR(20),
  delivery_address TEXT,
  delivery_notes TEXT,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('mercadopago', 'cash')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id VARCHAR(255),
  mp_preference_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================
-- TABLA: order_items
-- ========================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name VARCHAR(200) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================
-- TABLA: business_config
-- ========================
CREATE TABLE IF NOT EXISTS business_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(200) NOT NULL DEFAULT 'Mi Cafetería',
  address TEXT DEFAULT '',
  phone VARCHAR(50) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  logo_url TEXT,
  opening_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "23:00", "is_open": true},
    "tuesday": {"open": "09:00", "close": "23:00", "is_open": true},
    "wednesday": {"open": "09:00", "close": "23:00", "is_open": true},
    "thursday": {"open": "09:00", "close": "23:00", "is_open": true},
    "friday": {"open": "09:00", "close": "00:00", "is_open": true},
    "saturday": {"open": "10:00", "close": "00:00", "is_open": true},
    "sunday": {"open": "10:00", "close": "22:00", "is_open": true}
  }',
  is_open BOOLEAN DEFAULT TRUE,
  delivery_available BOOLEAN DEFAULT TRUE,
  takeaway_available BOOLEAN DEFAULT TRUE,
  dine_in_available BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================
-- ÍNDICES PARA PERFORMANCE
-- ========================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ========================
-- ROW LEVEL SECURITY (RLS)
-- ========================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;

-- Políticas: el service_role tiene acceso completo (usado por el backend)
-- Anon puede leer categorías, productos y configuración pública

CREATE POLICY "Service role full access admins" ON admins
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access categories" ON categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read active categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role full access products" ON products
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read available products" ON products
  FOR SELECT USING (is_available = true);

CREATE POLICY "Service role full access orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access order_items" ON order_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access business_config" ON business_config
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read business_config" ON business_config
  FOR SELECT USING (true);

-- ========================
-- DATOS INICIALES
-- ========================

-- Categorías de ejemplo
INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
  ('Cafés', 'cafes', 'Espressos, cortados, lattes y más', 1, true),
  ('Bebidas Frías', 'bebidas-frias', 'Jugos, frappés, smoothies', 2, true),
  ('Infusiones', 'infusiones', 'Tés, mates, hierbas', 3, true),
  ('Desayunos', 'desayunos', 'Tostadas, medialunas, sandwiches', 4, true),
  ('Almuerzos', 'almuerzos', 'Platos del día y opciones calientes', 5, true),
  ('Postres', 'postres', 'Tortas, cheesecakes y dulces', 6, true),
  ('Bebidas Alcohólicas', 'bebidas-alcoholicas', 'Vinos, cervezas, tragos', 7, true)
ON CONFLICT (slug) DO NOTHING;

-- Productos de ejemplo (requiere que las categorías existan)
DO $$
DECLARE
  cat_cafes UUID;
  cat_frias UUID;
  cat_desayunos UUID;
  cat_almuerzos UUID;
  cat_postres UUID;
  cat_infusiones UUID;
  cat_alcoholicas UUID;
BEGIN
  SELECT id INTO cat_cafes FROM categories WHERE slug = 'cafes';
  SELECT id INTO cat_frias FROM categories WHERE slug = 'bebidas-frias';
  SELECT id INTO cat_desayunos FROM categories WHERE slug = 'desayunos';
  SELECT id INTO cat_almuerzos FROM categories WHERE slug = 'almuerzos';
  SELECT id INTO cat_postres FROM categories WHERE slug = 'postres';
  SELECT id INTO cat_infusiones FROM categories WHERE slug = 'infusiones';
  SELECT id INTO cat_alcoholicas FROM categories WHERE slug = 'bebidas-alcoholicas';

  INSERT INTO products (category_id, name, description, price, is_available, is_featured, preparation_time, sort_order) VALUES
    -- Cafés
    (cat_cafes, 'Espresso Simple', 'Shot de espresso puro y concentrado', 800, true, false, 3, 1),
    (cat_cafes, 'Espresso Doble', 'Doble shot para los más cafeínómanos', 1100, true, false, 3, 2),
    (cat_cafes, 'Cortado', 'Espresso con un toque de leche caliente', 950, true, true, 4, 3),
    (cat_cafes, 'Café con Leche', 'Espresso con leche vaporizada cremosa', 1200, true, true, 5, 4),
    (cat_cafes, 'Cappuccino', 'Espresso, leche vaporizada y espuma perfecta', 1400, true, true, 6, 5),
    (cat_cafes, 'Latte', 'Espresso suave con mucha leche sedosa', 1500, true, false, 6, 6),
    (cat_cafes, 'Americano', 'Espresso con agua caliente', 1000, true, false, 4, 7),
    (cat_cafes, 'Flat White', 'Espresso doble con microespuma', 1600, true, true, 6, 8),
    
    -- Bebidas frías
    (cat_frias, 'Frappé de Café', 'Café helado batido con crema', 1800, true, true, 5, 1),
    (cat_frias, 'Limonada Natural', 'Limones frescos con agua mineral', 1200, true, false, 3, 2),
    (cat_frias, 'Smoothie de Frutas', 'Mix de frutas de temporada', 1600, true, false, 5, 3),
    (cat_frias, 'Jugo de Naranja', 'Naranjas exprimidas al momento', 1300, true, true, 4, 4),
    (cat_frias, 'Agua con Gas', 'Agua mineral gasificada', 600, true, false, 1, 5),
    
    -- Infusiones
    (cat_infusiones, 'Té Negro', 'English Breakfast o Earl Grey', 900, true, false, 4, 1),
    (cat_infusiones, 'Té Verde', 'Sencha o Jasmine Green', 900, true, false, 4, 2),
    (cat_infusiones, 'Mate Cocido', 'Clásico mate cocido argentino', 800, true, true, 3, 3),
    (cat_infusiones, 'Tereré', 'Mate frío con yuyo y limón', 1000, true, false, 5, 4),
    
    -- Desayunos
    (cat_desayunos, 'Medialuna con Manteca', 'Medialunas artesanales recién horneadas', 700, true, true, 2, 1),
    (cat_desayunos, 'Tostadas con Jamón y Queso', 'Pan de molde tostado con relleno clásico', 1500, true, true, 8, 2),
    (cat_desayunos, 'Avocado Toast', 'Pan tostado con palta, tomate y huevo poché', 2200, true, true, 10, 3),
    (cat_desayunos, 'Granola con Yogur', 'Granola artesanal con yogur griego y fruta', 1800, true, false, 5, 4),
    (cat_desayunos, 'Sandwich de Desayuno', 'Huevo, queso y jamón en pan brioche', 2000, true, false, 12, 5),
    
    -- Almuerzos  
    (cat_almuerzos, 'Tarta del Día', 'Tarta casera con ensalada fresca', 2500, true, true, 5, 1),
    (cat_almuerzos, 'Sándwich Club', 'Triple de pollo, jamón, huevo y lechuga', 2800, true, true, 10, 2),
    (cat_almuerzos, 'Wrap de Pollo', 'Pollo a la plancha con verduras y salsa', 2600, true, false, 12, 3),
    (cat_almuerzos, 'Bowl Vegano', 'Granos, legumbres y vegetales asados', 2400, true, false, 8, 4),
    (cat_almuerzos, 'Milanesa Napolitana', 'Clásica milanesa con jamón, queso y tomate', 3500, true, true, 20, 5),
    
    -- Postres
    (cat_postres, 'Cheesecake de Frutos Rojos', 'Cremoso cheesecake con coulis casero', 1800, true, true, 3, 1),
    (cat_postres, 'Brownie con Helado', 'Brownie tibio con helado de vainilla', 1600, true, true, 8, 2),
    (cat_postres, 'Tiramisú', 'Clásico italiano con mascarpone y café', 2000, true, false, 3, 3),
    (cat_postres, 'Medialunas de Manteca', 'Pack de 3 medialunas artesanales', 1200, true, false, 2, 4),
    
    -- Bebidas alcohólicas
    (cat_alcoholicas, 'Cerveza Artesanal', 'IPA o Stout según disponibilidad', 2000, true, true, 2, 1),
    (cat_alcoholicas, 'Vino de la Casa (copa)', 'Malbec o Chardonnay', 2200, true, false, 2, 2),
    (cat_alcoholicas, 'Aperol Spritz', 'Aperol, prosecco y agua con gas', 2800, true, true, 5, 3),
    (cat_alcoholicas, 'Clericot', 'Vino con frutas de temporada', 2500, true, false, 5, 4)
  ON CONFLICT DO NOTHING;
END $$;

-- Configuración inicial del negocio
INSERT INTO business_config (
  business_name, address, phone, email,
  is_open, delivery_available, takeaway_available, dine_in_available
) VALUES (
  'Mi Cafetería & Bar',
  'Av. Principal 123, Ciudad',
  '+54 9 11 1234-5678',
  'info@micafeteria.com',
  true, true, true, true
) ON CONFLICT DO NOTHING;

-- ========================
-- ADMIN INICIAL
-- Hash de "Admin2024!" generado con bcrypt (12 rounds)
-- CAMBIAR LA CONTRASEÑA DESPUÉS DEL PRIMER LOGIN
-- ========================
INSERT INTO admins (name, email, password_hash, role)
VALUES (
  'Administrador',
  'admin@cafeteria.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hFVBU5pHy',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Contraseña inicial: Admin2024!
-- IMPORTANTE: Cambiar inmediatamente en el panel de administración

COMMENT ON TABLE admins IS 'Administradores del sistema. Contraseña inicial: Admin2024!';
COMMENT ON TABLE orders IS 'Pedidos. El campo delivery_address solo aplica para order_type=delivery';
COMMENT ON TABLE business_config IS 'Configuración global del negocio. Solo debe existir un registro.';
