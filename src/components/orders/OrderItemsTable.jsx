// Tabla de productos del pedido.

import { DataTable } from '../tables/DataTable';

export const OrderItemsTable = ({ items = [] }) => <DataTable rows={items} columns={[{ key: 'nombre_producto', header: 'Producto' }, { key: 'cantidad', header: 'Cantidad' }, { key: 'total_linea', header: 'Total' }]} />;
