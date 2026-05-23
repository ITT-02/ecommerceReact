import React from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { EstadoTimelineCard } from './EstadoTimelineCard';

const pedidoBadge = (estado) => {
  const t = String(estado ?? '').toLowerCase();
  return t || 'pendiente';
};

const pedidoIconKey = (estado) => {
  const t = String(estado ?? '').toLowerCase();
  if (t === 'cancelado') return 'cancelado';
  if (t === 'entregado') return 'entregado';
  return 'pendiente';
};

export const UltimosPedidosCard = ({ ultimosPedidos = [] }) => {
  const items = (ultimosPedidos ?? []).map((r, idx) => {
    const estadoLabel = pedidoBadge(r.estado_pedido);

    return {
      id: r.numero_pedido ? `${r.numero_pedido}-${idx}` : idx,
      iconKey: pedidoIconKey(r.estado_pedido),
      estadoLabel,
      centro: (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.primary', lineHeight: 1.2 }}>
            N° {r.numero_pedido}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {r.nombre_cliente} • {r.estado_pago}
          </Typography>
        </Box>
      ),
      derechoValor: r.total ?? 0,
      derechoTipo: 'currency',
    };
  });

  return (
    <EstadoTimelineCard
      title="Últimos pedidos"
      type="orders"
      items={items}
      linkText="Ver detalles"
      onClick={() => {}}
    />
  );
};

