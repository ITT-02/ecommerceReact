/**
 * Configuración del menú administrativo.
 *
 */

import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CategoryIcon from '@mui/icons-material/Category';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ImageIcon from '@mui/icons-material/Image';
import InventoryIcon from '@mui/icons-material/Inventory';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import PaymentsIcon from '@mui/icons-material/Payments';
import PeopleIcon from '@mui/icons-material/People';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';
import StoreIcon from '@mui/icons-material/Store';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TuneIcon from '@mui/icons-material/Tune';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';

import {
  ADMIN_ROLES,
  CATALOG_ROLES,
  DASHBOARD_ROLES,
  FINANCE_ROLES,
  INVENTORY_ROLES,
  MARKETING_ROLES,
  SALES_ROLES,
} from '../../../utils/access/accessControl';

export const adminMenuGroups = [
  {
    title: 'Inicio',
    icon: DashboardRoundedIcon,
    items: [
      { label: 'Resumen general', path: '/admin/dashboard', icon: DashboardIcon, roles: DASHBOARD_ROLES },
    ],
  },
  {
    title: 'Configuración base',
    icon: TuneRoundedIcon,
    items: [
      { label: 'Métodos de pago', path: '/admin/metodos-pago', icon: PaymentsIcon, roles: SALES_ROLES },
      { label: 'Almacenes', path: '/admin/almacenes', icon: StoreIcon, roles: INVENTORY_ROLES },
      { label: 'Transportistas', path: '/admin/transportistas', icon: LocalShippingOutlinedIcon, roles: SALES_ROLES },
      { label: 'Personalización de tienda', path: '/admin/personalizacion-tienda', icon: StorefrontOutlinedIcon, roles: ADMIN_ROLES },
    ],
  },
  {
    title: 'Catálogo comercial',
    icon: CategoryRoundedIcon,
    items: [
      { label: 'Categorías', path: '/admin/categorias', icon: CategoryIcon, roles: CATALOG_ROLES },
      { label: 'Atributos y valores', path: '/admin/atributos', icon: TuneIcon, roles: CATALOG_ROLES },
      { label: 'Productos y multimedia', path: '/admin/productos', icon: Inventory2Icon, roles: CATALOG_ROLES },
      { label: 'Variantes y precios', path: '/admin/variantes', icon: InventoryIcon, roles: CATALOG_ROLES },
      { label: 'Opciones de personalización', path: '/admin/personalizacion-productos', icon: SettingsSuggestOutlinedIcon, roles: CATALOG_ROLES },
    ],
  },
  {
    title: 'Inventario',
    icon: Inventory2OutlinedIcon,
    items: [
      { label: 'Inventario', path: '/admin/inventario', icon: InventoryIcon, roles: INVENTORY_ROLES },
      { label: 'Movimientos', path: '/admin/movimientos', icon: SwapHorizIcon, roles: INVENTORY_ROLES },
      { label: 'Proveedores', path: '/admin/proveedores', icon: PeopleIcon, roles: INVENTORY_ROLES },
      { label: 'Compras / abastecimiento', path: '/admin/abastecimiento', icon: WarehouseOutlinedIcon, roles: INVENTORY_ROLES },
      { label: 'Recepción de mercadería', path: '/admin/recepcion-mercaderia', icon: AccountTreeOutlinedIcon, roles: INVENTORY_ROLES },
    ],
  },
  {
    title: 'Marketing',
    icon: CampaignOutlinedIcon,
    items: [
      { label: 'Promociones', path: '/admin/promociones', icon: LocalOfferIcon, roles: MARKETING_ROLES },
      { label: 'Banners', path: '/admin/banners', icon: ImageIcon, roles: MARKETING_ROLES },
    ],
  },
  {
    title: 'Ventas y atención',
    icon: SupportAgentRoundedIcon,
    items: [
      { label: 'Pedidos', path: '/admin/pedidos', icon: ReceiptLongIcon, roles: SALES_ROLES },
      { label: 'Cotizaciones', path: '/admin/cotizaciones', icon: RequestQuoteIcon, roles: SALES_ROLES },
      { label: 'Envíos', path: '/admin/envios', icon: LocalShippingOutlinedIcon, roles: SALES_ROLES },
      { label: 'Venta manual', path: '/admin/venta-manual', icon: PointOfSaleIcon, roles: SALES_ROLES },
      { label: 'Seguimiento vendedor', path: '/admin/seguimiento-vendedor', icon: PersonSearchOutlinedIcon, roles: SALES_ROLES },
    ],
  },
  {
    title: 'Finanzas',
     icon: AccountBalanceWalletOutlinedIcon,
    items: [
      { label: 'Pagos y comprobantes', path: '/admin/pagos', icon: PaymentsIcon, roles: SALES_ROLES },
      { label: 'Reembolsos', path: '/admin/reembolsos', icon: PaidOutlinedIcon, roles: FINANCE_ROLES },
      { label: 'Ganancias y márgenes', path: '/admin/finanzas', icon: QueryStatsIcon, roles: FINANCE_ROLES },
    ],
  },
  {
    title: 'Seguridad',
     icon: SecurityRoundedIcon,
    items: [
      { label: 'Usuarios', path: '/admin/usuarios', icon: PeopleIcon, roles: ADMIN_ROLES },
      { label: 'Roles', path: '/admin/roles', icon: AdminPanelSettingsIcon, roles: ADMIN_ROLES },
      { label: 'Permisos', path: '/admin/permisos', icon: SecurityIcon, roles: ADMIN_ROLES },
    ],
  },
];

export const filterMenuGroupsByRoles = (groups, userRoles = []) => {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.some((role) => userRoles.includes(role))),
    }))
    .filter((group) => group.items.length > 0);
};
