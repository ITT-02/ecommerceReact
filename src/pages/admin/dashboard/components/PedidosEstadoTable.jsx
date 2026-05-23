import { EstadoListCard } from './EstadoListCard';

export const PedidosEstadoTable = ({ pedidosPorEstado = [] }) => {
  // backend: { estado, total }
  const items = (pedidosPorEstado ?? []).map((r, idx) => ({
    id: r.estado ? `${r.estado}-${idx}` : idx,
    estado: r.estado,
    iconKey: r.estado,
    cantidad: undefined,
    derecho: 'currency',
    valor: r.total ?? 0,
  }));

  return (
    <EstadoListCard
      title="Pedidos por estado"
      type="orders"
      items={items}
      linkText="Ver todos"
      onClick={undefined}
    />
  );
};


