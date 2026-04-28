// Mapa principal de rutas de la aplicación.
// Aquí se separan rutas públicas, rutas de cliente y rutas administrativas.

import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminLayout } from '../layouts/admin/AdminLayout';
import { StoreLayout } from '../layouts/store/StoreLayout';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

import { NotAuthorizedPage } from '../pages/NotAuthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

import { DashboardPage } from '../pages/admin/DashboardPage';
import { AttributesPage } from '../pages/admin/attributes/AttributesPage';
import { BannersPage } from '../pages/admin/banners/BannersPage';
import { CategoriesPage } from '../pages/admin/categories/CategoriesPage';
import { InventoryPage } from '../pages/admin/inventory/InventoryPage';
import { WarehousesPage } from '../pages/admin/inventory/WarehousesPage';
import { OrdersPage } from '../pages/admin/orders/OrdersPage';
import { PaymentsPage } from '../pages/admin/payments/PaymentsPage';
import { PaymentMethodsPage } from '../pages/admin/payments/PaymentMethodsPage';
import { ProductsPage } from '../pages/admin/products/ProductsPage';
import { PromotionsPage } from '../pages/admin/promotions/PromotionsPage';
import { RolesPage } from '../pages/admin/settings/RolesPage';
import { PermissionsPage } from '../pages/admin/settings/PermissionsPage';
import { UsersPage } from '../pages/admin/users/UsersPage';
import { ProductVariantsPage } from '../pages/admin/variants/ProductVariantsPage';

import { AboutPage } from '../pages/store/AboutPage';
import { AddressesPage } from '../pages/store/AddressesPage';
import { CartPage } from '../pages/store/CartPage';
import { CatalogPage } from '../pages/store/CatalogPage';
import { CheckoutPage } from '../pages/store/CheckoutPage';
import { HomePage } from '../pages/store/HomePage';
import { MyOrdersPage } from '../pages/store/MyOrdersPage';
import { OrderTrackingPage } from '../pages/store/OrderTrackingPage';
import { ProductDetailPage } from '../pages/store/ProductDetailPage';
import { ProfilePage } from '../pages/store/ProfilePage';

import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { RoleRoute } from './RoleRoute';

import {
  ADMIN_ROLES,
  CATALOG_ROLES,
  DASHBOARD_ROLES,
  INVENTORY_ROLES,
  MARKETING_ROLES,
  SALES_ROLES,
} from '../utils/access/accessControl';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas públicas de autenticación */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
      </Route>

      {/* Rutas públicas de tienda */}
      <Route element={<StoreLayout />}>
        <Route index element={<HomePage />} />
        <Route path="nosotros" element={<AboutPage />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="productos/:slug" element={<ProductDetailPage />} />
        <Route path="no-autorizado" element={<NotAuthorizedPage />} />

        {/* Rutas protegidas del cliente */}
        <Route element={<ProtectedRoute />}>
          <Route path="carrito" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="mis-pedidos" element={<MyOrdersPage />} />
          <Route path="mis-pedidos/:id" element={<OrderTrackingPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="direcciones" element={<AddressesPage />} />
        </Route>
      </Route>

      {/* Rutas protegidas del panel administrativo */}
      <Route element={<ProtectedRoute />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Panel */}
          <Route path="dashboard" element={<RoleRoute allowedRoles={DASHBOARD_ROLES}><DashboardPage /></RoleRoute>} />

          {/* Catálogo */}
          <Route path="categorias" element={<RoleRoute allowedRoles={CATALOG_ROLES}><CategoriesPage /></RoleRoute>} />
          <Route path="atributos" element={<RoleRoute allowedRoles={CATALOG_ROLES}><AttributesPage /></RoleRoute>} />
          <Route path="productos" element={<RoleRoute allowedRoles={CATALOG_ROLES}><ProductsPage /></RoleRoute>} />
          <Route path="variantes" element={<RoleRoute allowedRoles={CATALOG_ROLES}><ProductVariantsPage /></RoleRoute>} />

          {/* Inventario */}
          <Route path="almacenes" element={<RoleRoute allowedRoles={INVENTORY_ROLES}><WarehousesPage /></RoleRoute>} />
          <Route path="inventario" element={<RoleRoute allowedRoles={INVENTORY_ROLES}><InventoryPage /></RoleRoute>} />

          {/* Marketing */}
          <Route path="promociones" element={<RoleRoute allowedRoles={MARKETING_ROLES}><PromotionsPage /></RoleRoute>} />
          <Route path="banners" element={<RoleRoute allowedRoles={MARKETING_ROLES}><BannersPage /></RoleRoute>} />

          {/* Ventas */}
          <Route path="pedidos" element={<RoleRoute allowedRoles={SALES_ROLES}><OrdersPage /></RoleRoute>} />
          <Route path="pagos" element={<RoleRoute allowedRoles={SALES_ROLES}><PaymentsPage /></RoleRoute>} />
          <Route path="metodos-pago" element={<RoleRoute allowedRoles={SALES_ROLES}><PaymentMethodsPage /></RoleRoute>} />

          {/* Administración */}
          <Route path="usuarios" element={<RoleRoute allowedRoles={ADMIN_ROLES}><UsersPage /></RoleRoute>} />
          <Route path="roles" element={<RoleRoute allowedRoles={ADMIN_ROLES}><RolesPage /></RoleRoute>} />
          <Route path="permisos" element={<RoleRoute allowedRoles={ADMIN_ROLES}><PermissionsPage /></RoleRoute>} />
        </Route>
      </Route>

      {/* Ruta 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};