/**
 * Configuración del menú administrativo.
 *
 * Responsabilidad:
 * - Definir grupos del menú.
 * - Definir rutas.
 * - Definir íconos.
 * - Definir roles permitidos por opción.
 *
 * Este archivo NO renderiza componentes visuales.
 */

import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import TuneIcon from '@mui/icons-material/Tune';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ImageIcon from '@mui/icons-material/Image';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentsIcon from '@mui/icons-material/Payments';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';

import {
  ADMIN_ROLES,
  CATALOG_ROLES,
  DASHBOARD_ROLES,
  INVENTORY_ROLES,
  MARKETING_ROLES,
  SALES_ROLES,
} from '../../../utils/access/accessControl';

export const adminMenuGroups = [
  {
    title: 'Panel',
    items: [
      {
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: DashboardIcon,
        roles: DASHBOARD_ROLES,
      },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      {
        label: 'Categorías',
        path: '/admin/categorias',
        icon: CategoryIcon,
        roles: CATALOG_ROLES,
      },
      {
        label: 'Atributos',
        path: '/admin/atributos',
        icon: TuneIcon,
        roles: CATALOG_ROLES,
      },
      {
        label: 'Productos',
        path: '/admin/productos',
        icon: Inventory2Icon,
        roles: CATALOG_ROLES,
      },
      {
        label: 'Variantes',
        path: '/admin/variantes',
        icon: InventoryIcon,
        roles: CATALOG_ROLES,
      },
    ],
  },
  {
    title: 'Inventario',
    items: [
      {
        label: 'Almacenes',
        path: '/admin/almacenes',
        icon: StoreIcon,
        roles: INVENTORY_ROLES,
      },
      {
        label: 'Inventario',
        path: '/admin/inventario',
        icon: InventoryIcon,
        roles: INVENTORY_ROLES,
      },
      {
        label: 'Movimientos',
        path: '/admin/inventario/movimientos',
        icon: SwapHorizIcon,
        roles: INVENTORY_ROLES,
      },
    ],
  },
  {
    title: 'Marketing',
    items: [
      {
        label: 'Promociones',
        path: '/admin/promociones',
        icon: LocalOfferIcon,
        roles: MARKETING_ROLES,
      },
      {
        label: 'Banners',
        path: '/admin/banners',
        icon: ImageIcon,
        roles: MARKETING_ROLES,
      },
    ],
  },
  {
    title: 'Ventas',
    items: [
      {
        label: 'Pedidos',
        path: '/admin/pedidos',
        icon: ReceiptLongIcon,
        roles: SALES_ROLES,
      },
      {
        label: 'Pagos',
        path: '/admin/pagos',
        icon: PaymentsIcon,
        roles: SALES_ROLES,
      },
      {
        label: 'Métodos de pago',
        path: '/admin/metodos-pago',
        icon: PaymentsIcon,
        roles: SALES_ROLES,
      },
    ],
  },
  {
    title: 'Administración',
    items: [
      {
        label: 'Usuarios',
        path: '/admin/usuarios',
        icon: PeopleIcon,
        roles: ADMIN_ROLES,
      },
      {
        label: 'Roles',
        path: '/admin/roles',
        icon: AdminPanelSettingsIcon,
        roles: ADMIN_ROLES,
      },
      {
        label: 'Permisos',
        path: '/admin/permisos',
        icon: SecurityIcon,
        roles: ADMIN_ROLES,
      },
    ],
  },
];

export const filterMenuGroupsByRoles = (groups, userRoles = []) => {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.roles.some((role) => userRoles.includes(role)),
      ),
    }))
    .filter((group) => group.items.length > 0);
};
