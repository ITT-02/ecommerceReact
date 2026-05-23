import React from 'react';

import { Box, Typography } from '@mui/material';

import { EstadoTimelineCard } from './EstadoTimelineCard';
import { joinText } from '../../../../utils/formatters';

const iconByTipo = (tipo) => {
  const t = String(tipo ?? '').toLowerCase();
  if (t === 'venta') return 'venta';
  if (t === 'compra') return 'compra';
  if (t === 'envio') return 'envio';
  return 'recibo';
};

export const MovimientosRecientesCard = ({ movimientosRecientes = [] }) => {
  const items = (movimientosRecientes ?? []).map((r, idx) => {
    const estadoLabel = String(r.tipo_movimiento ?? 'mov');

    return {
      id: `${r.tipo_movimiento ?? 'mov'}-${idx}`,
      iconKey: iconByTipo(r.tipo_movimiento),
      estadoLabel,
      centro: (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.primary', lineHeight: 1.2 }}>
            {joinText(r.producto_nombre, r.nombre_variante)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {r.created_at}
          </Typography>
        </Box>
      ),
      derechoValor: r.cantidad ?? 0,
      derechoTipo: 'number',
    };
  });

  return (
    <EstadoTimelineCard
      title="Movimientos recientes"
      type="movements"
      items={items}
      linkText="Ver detalles"
      onClick={() => {}}
    />
  );
};

