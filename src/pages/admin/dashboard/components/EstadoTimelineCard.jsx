import React from 'react';

import {
  Box,
  Card,
  CardContent,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';

import { formatCurrency, formatDate } from '../../../../utils/formatters';

const iconByKey = {
  // Inventario
  stock_bajo: Inventory2OutlinedIcon,
  sin_stock: CancelOutlinedIcon,
  normal: CheckCircleOutlineOutlinedIcon,

  // Pedidos (ejemplos)
  cancelado: CancelOutlinedIcon,
  entregado: CheckCircleOutlineOutlinedIcon,
  pendiente: PendingActionsOutlinedIcon,

  // Movimientos
  venta: ShoppingCartOutlinedIcon,
  compra: ReceiptLongOutlinedIcon,
  envio: LocalShippingOutlinedIcon,
  recibo: ReceiptOutlinedIcon,
};

const badgePalette = (type, estado) => {
  const t = String(estado ?? '').toLowerCase();

  switch (t) {
    case 'sin_stock':
    case 'cancelado':
    case 'rechazado':
      return { bg: 'rgba(255, 210, 210, 0.6)', color: '#7a1010' };

    case 'stock_bajo':
    case 'pendiente':
      return { bg: 'rgba(205, 235, 255, 0.65)', color: '#0b4a6e' };

    case 'normal':
    case 'entregado':
    case 'aprobado':
      return { bg: 'rgba(193, 255, 214, 0.55)', color: '#0f5f2e' };

    default:
      return { bg: 'rgba(230, 236, 255, 0.55)', color: '#1f2a44' };
  }
};

const estadoBadge = (type, estado) => {
  const badge = badgePalette(type, estado);

  return (
    <Box
      component="span"
      sx={{
        px: 1.25,
        py: 0.5,
        borderRadius: 999,
        bgcolor: badge.bg,
        color: badge.color,
        fontWeight: 800,
        fontSize: '0.76rem',
        whiteSpace: 'nowrap',
        letterSpacing: 0.1,
      }}
    >
      {estado}
    </Box>
  );
};

const EstadoTimelineRow = ({
  type,
  leftIconKey,
  estado,
  centro,
  valor,
  valorTipo,
}) => {
  const Icon = iconByKey[leftIconKey] ?? ReceiptLongOutlinedIcon;
  const badge = badgePalette(type, estado);

  const renderValor = () => {
    if (valorTipo === 'currency') return formatCurrency(valor ?? 0);
    if (valorTipo === 'date') return formatDate(valor);
    return valor ?? '-';
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ width: '100%' }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(235, 242, 255, 1)',
          color: 'text.secondary',
          border: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 18, opacity: 0.9 }} />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          component="span"
          sx={{
            px: 1.25,
            py: 0.5,
            borderRadius: 999,
            bgcolor: badge.bg,
            color: badge.color,
            fontWeight: 800,
            fontSize: '0.76rem',
            whiteSpace: 'nowrap',
            letterSpacing: 0.1,
          }}
        >
          {estado}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          {centro}
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
        <Typography variant="body2" sx={{ fontWeight: 950, color: 'text.primary' }}>
          {renderValor()}
        </Typography>
      </Box>
    </Stack>
  );
};

/**
 * Card/lista vertical compacta estilo dashboard minimalista.
 */
export const EstadoTimelineCard = ({
  title,
  type,
  items = [],
  linkText = 'Ver detalles',
  onClick,
}) => {
  return (
    <Card
      elevation={0}
      sx={(theme) => ({
        borderRadius: 3,
        bgcolor: theme.palette.background.paper,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: theme.shadows[1],
      })}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 900,
            color: 'text.primary',
            mb: 1.25,
            letterSpacing: 0.1,
          }}
        >
          {title}
        </Typography>

        <Stack divider={<Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />} spacing={0}>
          {items.length === 0 ? (
            <Box sx={{ py: 2.2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                No hay datos
              </Typography>
            </Box>
          ) : (
            items.map((item, idx) => (
              <Box key={`${item.estado ?? item.id ?? idx}`} sx={{ py: 1.05, px: 0.25 }}>
                <EstadoTimelineRow
                  type={type}
                  leftIconKey={item.iconKey}
                  estado={item.estadoLabel}
                  centro={item.centro}
                  valor={item.derechoValor}
                  valorTipo={item.derechoTipo}
                />
              </Box>
            ))
          )}
        </Stack>

        <Box sx={{ mt: 1.25, display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            component="button"
            type="button"
            onClick={onClick}
            underline="none"
            sx={{
              fontSize: '0.78rem',
              color: 'primary.main',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              '&:hover': { opacity: 0.9 },
            }}
          >
            {linkText}
            <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};

