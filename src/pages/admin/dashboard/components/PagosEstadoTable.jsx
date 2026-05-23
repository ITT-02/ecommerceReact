import { EstadoListCard } from './EstadoListCard';

export const PagosEstadoTable = ({ pagosPorEstado = [] }) => {
  // backend: { estado, total, monto_total }
  const items = (pagosPorEstado ?? []).map((r, idx) => ({
    id: r.estado ? `${r.estado}-${idx}` : idx,
    estado: r.estado,
    iconKey: r.estado,
    cantidad: Number(r.total ?? 0),
    derecho: 'currency',
    valor: r.monto_total ?? 0,
  }));

  return (
    <EstadoListCard
      title="Pagos por estado"
      type="payments"
      items={items}
      linkText="Ver detalles"
      onClick={undefined}
    />
  );
};


