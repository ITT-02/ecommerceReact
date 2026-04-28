// Tabla simple de pedidos recientes.

import { DataTable } from '../tables/DataTable';

export const RecentOrdersTable = ({ orders = [] }) => <DataTable rows={orders} columns={[{ key: 'numero_pedido', header: 'Pedido' }, { key: 'estado_pedido', header: 'Estado' }, { key: 'total', header: 'Total' }]} />;
