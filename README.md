# ☕ Cafetería & Bar — Sistema de Pedidos

Sistema completo para cafetería/bar con menú digital, pedidos online, pago con MercadoPago, código QR y panel de administración.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite 4.5.3 + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Base de datos | Supabase (PostgreSQL) |
| Pagos | MercadoPago API v2 |
| Estado | Zustand |
| Estilos | CSS Modules |

> **Mac Catalina (macOS 10.15)**: Compatible. Usar **Node.js 18 LTS** + **TypeScript 5.x** + **Vite 4.5.3**

---

## 📋 Requisitos Previos

- **Node.js 18 LTS** (última versión que soporta macOS Catalina 10.15)
  ```
  # Verificar versión
  node --version  # debe ser v18.x.x

  # Instalar con nvm si no tenés Node 18:
  nvm install 18
  nvm use 18
  ```
- npm 9+
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Cuenta en [MercadoPago Developers](https://www.mercadopago.com.ar/developers) (gratuita)

---

## ⚡ Instalación Rápida

### 1. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurar Supabase

1. Crear una cuenta en [supabase.com](https://supabase.com)
2. Crear un nuevo proyecto
3. Ir a **SQL Editor** y ejecutar el archivo `docs/schema.sql`
4. Ir a **Settings > API** y copiar:
   - Project URL
   - anon/public key
   - service_role key (¡mantener privada!)

### 3. Configurar MercadoPago

1. Ingresar a [mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers)
2. Ir a **Tus integraciones > Crear aplicación**
3. En **Credenciales de prueba** copiar:
   - Access Token (empieza con `TEST-`)
   - Public Key (empieza con `TEST-`)
4. Para producción, usar las credenciales de producción (`APP_USR-`)

### 4. Configurar variables de entorno

**Backend** — copiar y editar `.env`:
```bash
cd backend
cp .env.example .env
# Editar con tu editor favorito
```

Completar en `backend/.env`:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

JWT_SECRET=un-secreto-muy-largo-y-seguro-de-al-menos-32-caracteres

MP_ACCESS_TOKEN=TEST-tu-access-token
MP_PUBLIC_KEY=TEST-tu-public-key

PUBLIC_MENU_URL=http://localhost:5173/menu
BUSINESS_NAME=Mi Cafetería & Bar
```

**Frontend** — copiar `.env`:
```bash
cd frontend
cp .env.example .env
# Solo necesitás cambiar si el backend no corre en localhost:3001
```

### 5. Iniciar el proyecto

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Abrir en el navegador:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Panel Admin**: http://localhost:5173/admin
- **Menú (QR)**: http://localhost:5173/menu

---

## 🔑 Acceso al Panel de Administración

| Campo | Valor |
|-------|-------|
| URL | http://localhost:5173/admin |
| Email | admin@cafeteria.com |
| Contraseña | `Admin2024!` |

> ⚠️ **Cambiar la contraseña inmediatamente** en Panel Admin > Configuración > Seguridad

---

## 🚀 Funcionalidades

### Para Clientes (sin registro)
- ✅ Ver menú completo por categorías
- ✅ Buscar productos
- ✅ Agregar al carrito y modificar cantidades
- ✅ Elegir tipo de pedido: en el local, para llevar o envío
- ✅ Ingresar mesa (pedido en local) o dirección (delivery)
- ✅ Pagar con MercadoPago o efectivo
- ✅ Ver estado del pedido en tiempo real
- ✅ Escanear código QR para ver el menú

### Para el Administrador
- ✅ Dashboard con estadísticas del día
- ✅ Gestión de pedidos en tiempo real (actualización automática)
- ✅ Cambiar estado de pedidos (pendiente → confirmado → preparando → listo → entregado)
- ✅ Confirmar pagos en efectivo
- ✅ CRUD completo de productos y categorías
- ✅ Control de disponibilidad de productos (activar/desactivar)
- ✅ Destacar productos en la página de inicio
- ✅ Generador de QR para el menú y por mesa
- ✅ Configuración del negocio (nombre, dirección, horarios)
- ✅ Activar/desactivar servicios (dine-in, takeaway, delivery)
- ✅ Abrir/cerrar el local con un click
- ✅ Cambio de contraseña seguro

---

## 💳 MercadoPago — Flujo de Pago

```
Cliente elige MP → Backend crea Preference → Redirección a MP → 
Cliente paga → Webhook notifica backend → Estado del pedido actualizado
```

**En desarrollo**: Se usa el sandbox de MercadoPago (tarjetas de prueba disponibles en la documentación de MP)

**En producción**: Cambiar `MP_ACCESS_TOKEN` a las credenciales de producción en el `.env` del backend

### Configurar Webhook en Producción
1. En MP Developers, ir a tu aplicación
2. Configurar webhook URL: `https://tu-backend.com/api/payments/webhook`
3. Seleccionar el evento: `payment`

---

## 📱 Código QR

El QR del menú apunta a la URL configurada en `PUBLIC_MENU_URL` en el `.env` del backend.

**Para producción**: Cambiar a tu dominio real:
```env
PUBLIC_MENU_URL=https://micafeteria.com/menu
```

---

## 🌐 Despliegue en Producción

### Backend (Railway, Render, Fly.io)
```bash
cd backend
npm run build
# Deployar la carpeta dist/ + package.json
```

### Frontend (Vercel, Netlify)
```bash
cd frontend
npm run build
# Deployar la carpeta dist/
```

### Variables de entorno en producción
- Cambiar `NODE_ENV=production`
- Cambiar `FRONTEND_URL` a tu dominio real
- Usar credenciales de producción de MercadoPago
- Actualizar `PUBLIC_MENU_URL` a tu dominio real
- Usar `JWT_SECRET` con al menos 64 caracteres random

---

## 📁 Estructura del Proyecto

```
cafeteria-app/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   │   ├── auth.controller.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── orders.controller.ts
│   │   │   ├── payments.controller.ts (MercadoPago)
│   │   │   ├── qr.controller.ts
│   │   │   └── config.controller.ts
│   │   ├── routes/          # Rutas de la API
│   │   ├── middleware/      # Auth JWT
│   │   ├── utils/           # Supabase client, helpers
│   │   ├── types/           # TypeScript types
│   │   └── index.ts         # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client + API functions
│   │   ├── components/      # Componentes reutilizables
│   │   │   ├── layout/      # Navbar
│   │   │   ├── menu/        # ProductCard
│   │   │   └── admin/       # AdminLayout
│   │   ├── pages/           # Páginas
│   │   │   ├── HomePage.tsx
│   │   │   ├── MenuPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── OrderStatusPage.tsx
│   │   │   └── admin/
│   │   │       ├── AdminLoginPage.tsx
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminOrders.tsx
│   │   │       ├── AdminProducts.tsx
│   │   │       ├── AdminCategories.tsx
│   │   │       ├── AdminQR.tsx
│   │   │       └── AdminConfig.tsx
│   │   ├── store/           # Zustand (cart + auth)
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Formatters
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── docs/
    └── schema.sql           # SQL para Supabase
```

---

## 🔧 Solución de Problemas

**Error: CORS**
→ Verificar que `FRONTEND_URL` en el `.env` del backend coincide con la URL del frontend

**Error: Supabase RLS policy**
→ Verificar que se esté usando el `SUPABASE_SERVICE_ROLE_KEY` en el backend (no el anon key)

**Error: MercadoPago preference**
→ Verificar que el `MP_ACCESS_TOKEN` es correcto y que la cuenta MP tiene credenciales activas

**Node version en Catalina**
→ Usar exactamente Node.js 18.x.x. Node 19+ no soporta macOS 10.15

**Puerto ocupado**
→ Cambiar `PORT` en el `.env` del backend y el proxy en `vite.config.ts`

---

## 📞 Soporte

Si tenés problemas con la configuración, revisar los logs del backend en la terminal donde corrés `npm run dev`.
