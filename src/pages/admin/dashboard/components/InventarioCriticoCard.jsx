import React from 'react';

import { Box, Typography } from '@mui/material';

import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import { EstadoTimelineCard } from './EstadoTimelineCard';

const estadoToBadge = (estadoStock) => {
  const t = String(estadoStock ?? '').toLowerCase();
  if (t === 'sin_stock') return 'sin_stock';
  if (t === 'stock_bajo') return 'stock_bajo';
  if (t === 'normal') return 'normal';
  return t || 'normal';
};

const estadoToIconKey = (estadoStock) => {
  const t = String(estadoStock ?? '').toLowerCase();
  if (t === 'sin_stock') return 'sin_stock';
  if (t === 'stock_bajo') return 'stock_bajo';
  if (t === 'normal') return 'normal';
  return 'stock_bajo';
};

export const InventarioCriticoCard = ({ inventarioCritico = [] }) => {
  const items = (inventarioCritico ?? []).map((r, idx) => {
    const estadoLabel = estadoToBadge(r.estado_stock);

    return {
      id: r.producto_nombre ? `${r.producto_nombre}-${idx}` : idx,
      iconKey: estadoToIconKey(r.estado_stock),
      estadoLabel,
      centro: (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.primary', lineHeight: 1.2 }}>
            {r.producto_nombre}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {r.nombre_variante} • {r.almacen_nombre}
          </Typography>
        </Box>
      ),
      derechoValor: r.cantidad_disponible ?? 0,
      derechoTipo: 'number',
    };
  });

  return (
    <EstadoTimelineCard
      title="Inventario crítico"
      type="inventory"
      items={items}
      linkText="Ver detalles"
      onClick={() => {}}
    />
  );
};

