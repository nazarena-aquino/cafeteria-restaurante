import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'

// Public pages
import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderStatusPage from './pages/OrderStatusPage'

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminConfig from './pages/admin/AdminConfig'
import AdminQR from './pages/admin/AdminQR'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, token } = useAuthStore()
  if (!token && !admin) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

export default function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-status/:orderNumber" element={<OrderStatusPage />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="config" element={<AdminConfig />} />
        <Route path="qr" element={<AdminQR />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
