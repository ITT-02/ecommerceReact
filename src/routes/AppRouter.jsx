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
import { MovementsPage } from '../pages/admin/inventory/MovementsPage';

import { WarehousesPage } from '../pages/admin/inventory/WarehousesPage';
import { OrdersPage } from '../pages/admin/orders/OrdersPage';
import { QuotesPage } from '../pages/admin/quotes/QuotesPage';
import { PaymentsPage } from '../pages/admin/payments/PaymentsPage';
import { PaymentMethodsPage } from '../pages/admin/payments/PaymentMethodsPage';
import { ProductsPage } from '../pages/admin/products/ProductsPage';
import { PromotionsPage } from '../pages/admin/promotions/PromotionsPage';
import { RolesPage } from '../pages/admin/settings/RolesPage';
import { PermissionsPage } from '../pages/admin/settings/PermissionsPage';
import { UsersPage } from '../pages/admin/users/UsersPage';
import { ProductVariantsPage } from '../pages/admin/variants/ProductVariantsPage';
import { FinancePage } from '../pages/admin/finance/FinancePage';
import { ManualSalesPage } from '../pages/admin/manualSales/ManualSalesPage';
import { SellerFollowUpPage } from '../pages/admin/sellerFollowUp/SellerFollowUpPage';
import { CarriersPage } from '../pages/admin/carriers/CarriersPage';
import { ProcurementPage } from '../pages/admin/procurement/ProcurementPage';
import { GoodsReceptionPage } from '../pages/admin/reception/GoodsReceptionPage';
import { RefundsPage } from '../pages/admin/refunds/RefundsPage';
import { ShipmentsPage } from '../pages/admin/shipments/ShipmentsPage';
import { StoreCustomizationPage } from '../pages/admin/storeSettings/StoreCustomizationPage';
import { SuppliersPage } from '../pages/admin/suppliers/SuppliersPage';
import { ProductPersonalizationPage } from '../pages/admin/productsPersonalization/ProductPersonalizationPage';

import { AddressesPage } from '../pages/store/AddressesPage';
import { CartPage } from '../pages/store/CartPage';
import { CatalogPage } from '../pages/store/CatalogPage';
import { ContactPage } from '../pages/store/ContactPage';
import { CheckoutPage } from '../pages/store/CheckoutPage';
import { HomePage } from '../pages/store/HomePage';
import { WholesalePage } from '../pages/store/WholesalePage';
import { MyOrdersPage } from '../pages/store/MyOrdersPage';
import { MyQuotesPage } from '../pages/store/MyQuotesPage';
import { QuoteDetailPage } from '../pages/store/QuoteDetailPage';
import { QuoteRequestPage } from '../pages/store/QuoteRequestPage';
import { OrderTrackingPage } from '../pages/store/OrderTrackingPage';
import { ProductDetailPage } from '../pages/store/ProductDetailPage';
import { ProfilePage } from '../pages/store/ProfilePage';
import { StoryPage } from '../pages/store/StoryPage';

import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { RoleRoute } from './RoleRoute';

import {
  ADMIN_ROLES,
  CATALOG_ROLES,
  DASHBOARD_ROLES,
  INVENTORY_ROLES,
  FINANCE_ROLES,
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
        <Route path="nosotros" element={<Navigate to="/nuestra-historia" replace />} />
        <Route path="nuestra-historia" element={<StoryPage />} />
        <Route path="mayoristas" element={<WholesalePage />} />
        <Route path="contacto" element={<ContactPage />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="productos/:slug" element={<ProductDetailPage />} />
        <Route path="no-autorizado" element={<NotAuthorizedPage />} />

        {/* Rutas protegidas del cliente */}
        <Route element={<ProtectedRoute />}>
          <Route path="carrito" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="cotizacion/:slug" element={<QuoteRequestPage />} />
          <Route path="mis-cotizaciones" element={<MyQuotesPage />} />
          <Route path="mis-cotizaciones/:id" element={<QuoteDetailPage />} />
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
          <Route path="personalizacion-productos" element={<RoleRoute allowedRoles={CATALOG_ROLES}><ProductPersonalizationPage /></RoleRoute>} />

          {/* Inventario */}
          <Route path="almacenes" element={<RoleRoute allowedRoles={INVENTORY_ROLES}><WarehousesPage /></RoleRoute>} />
          <Route path="inventario" element={<RoleRoute allowedRoles={INVENTORY_ROLES}><InventoryPage /></RoleRoute>} />
          <Route path="movimientos" element={<RoleRoute allowedRoles={INVENTORY_ROLES}><MovementsPage /></RoleRoute>} />
          <Route path="proveedores" element={<RoleRoute allowedRoles={INVENTORY_ROLES}><SuppliersPage /></RoleRoute>} />
          <Route path="abastecimiento" element={<RoleRoute allowedRoles={INVENTORY_ROLES}><ProcurementPage /></RoleRoute>} />
          <Route path="recepcion-mercaderia" element={<RoleRoute allowedRoles={INVENTORY_ROLES}><GoodsReceptionPage /></RoleRoute>} />

          {/* Marketing */}
          <Route path="promociones" element={<RoleRoute allowedRoles={MARKETING_ROLES}><PromotionsPage /></RoleRoute>} />
          <Route path="banners" element={<RoleRoute allowedRoles={MARKETING_ROLES}><BannersPage /></RoleRoute>} />

          {/* Ventas */}
          <Route path="pedidos" element={<RoleRoute allowedRoles={SALES_ROLES}><OrdersPage /></RoleRoute>} />
          <Route path="cotizaciones" element={<RoleRoute allowedRoles={SALES_ROLES}><QuotesPage /></RoleRoute>} />
          <Route path="venta-manual" element={<RoleRoute allowedRoles={SALES_ROLES}><ManualSalesPage /></RoleRoute>} />
          <Route path="seguimiento-vendedor" element={<RoleRoute allowedRoles={SALES_ROLES}><SellerFollowUpPage /></RoleRoute>} />
          <Route path="envios" element={<RoleRoute allowedRoles={SALES_ROLES}><ShipmentsPage /></RoleRoute>} />
          <Route path="pagos" element={<RoleRoute allowedRoles={SALES_ROLES}><PaymentsPage /></RoleRoute>} />
          <Route path="metodos-pago" element={<RoleRoute allowedRoles={SALES_ROLES}><PaymentMethodsPage /></RoleRoute>} />
          <Route path="transportistas" element={<RoleRoute allowedRoles={SALES_ROLES}><CarriersPage /></RoleRoute>} />
          <Route path="personalizacion-tienda" element={<RoleRoute allowedRoles={ADMIN_ROLES}><StoreCustomizationPage /></RoleRoute>} />

          {/* Finanzas */}
          <Route path="finanzas" element={<RoleRoute allowedRoles={FINANCE_ROLES}><FinancePage /></RoleRoute>} />
          <Route path="reembolsos" element={<RoleRoute allowedRoles={FINANCE_ROLES}><RefundsPage /></RoleRoute>} />

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