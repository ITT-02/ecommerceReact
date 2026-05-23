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
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CreditCardOffOutlinedIcon from '@mui/icons-material/CreditCardOffOutlined';

import { formatCurrency } from '../../../../utils/formatters';

const iconByKey = {
  // Pedidos (estado -> icono)
  pendiente: PendingActionsOutlinedIcon,
  confirmado: CheckCircleOutlineOutlinedIcon,
  preparando: Inventory2OutlinedIcon,
  enviado: LocalShippingOutlinedIcon,
  entregado: CheckCircleOutlineOutlinedIcon,
  cancelado: CancelOutlinedIcon,

  // Pagos (estado -> icono)
  validando: ReceiptLongOutlinedIcon,
  aprobado: CheckCircleOutlineOutlinedIcon,
  rechazado: CancelOutlinedIcon,
};

const badgePalette = (type, estado) => {
  const t = String(estado ?? '').toLowerCase();

  if (type === 'orders') {
    switch (t) {
      case 'pendiente':
        return { bg: 'rgba(237, 224, 255, 0.55)', color: '#4c2a86' }; // morado pastel
      case 'confirmado':
      case 'entregado':
        return { bg: 'rgba(193, 255, 214, 0.55)', color: '#0f5f2e' }; // verde pastel
      case 'preparando':
        return { bg: 'rgba(205, 235, 255, 0.65)', color: '#0b4a6e' }; // azul claro
      case 'enviado':
        return { bg: 'rgba(210, 247, 255, 0.65)', color: '#0a5a74' };
      case 'cancelado':
        return { bg: 'rgba(255, 210, 210, 0.6)', color: '#7a1010' };
      default:
        return { bg: 'rgba(230, 236, 255, 0.55)', color: '#1f2a44' };
    }
  }

  // payments
  switch (t) {
    case 'validando':
      return { bg: 'rgba(237, 224, 255, 0.55)', color: '#4c2a86' };
    case 'aprobado':
      return { bg: 'rgba(193, 255, 214, 0.55)', color: '#0f5f2e' };
    case 'rechazado':
      return { bg: 'rgba(255, 210, 210, 0.6)', color: '#7a1010' };
    case 'pendiente':
      return { bg: 'rgba(205, 235, 255, 0.65)', color: '#0b4a6e' };
    default:
      return { bg: 'rgba(230, 236, 255, 0.55)', color: '#1f2a44' };
  }
};

const formatMaybeCurrency = (value) => {
  if (value === null || value === undefined) return formatCurrency(0);
  const n = Number(value);
  return formatCurrency(Number.isFinite(n) ? n : 0);
};

const EstadoRow = ({ type, item }) => {
  const Icon = iconByKey[item.iconKey] ?? ReceiptLongOutlinedIcon;
  const badge = badgePalette(type, item.estado);

  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ width: '100%' }}>
      {/* Ícono (extremo izquierdo) */}
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

      {/* Centro */}
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
          {item.estado}
        </Box>

        {item.cantidad !== undefined && item.cantidad !== null ? (
          <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.primary' }}>
            {item.cantidad}
          </Typography>
        ) : null}
      </Box>

      {/* Extremo derecho */}
      <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
        <Typography variant="body2" sx={{ fontWeight: 950, color: 'text.primary' }}>
          {item.derecho === 'currency' ? formatMaybeCurrency(item.valor) : item.valor}
        </Typography>
      </Box>
    </Stack>
  );
};

/**
 * Card con lista vertical compacta para “Estados” (pedidos/pagos).
 */
export const EstadoListCard = ({
  title,
  type,
  items = [],
  linkText = 'Ver todos',
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
        {/* Título (arriba izquierda) */}
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
              <Box key={`${item.estado}-${idx}`} sx={{ py: 1.05, px: 0.25 }}>
                <EstadoRow type={type} item={item} />
              </Box>
            ))
          )}
        </Stack>

        {/* Enlace inferior sutil */}
        <Box sx={{ mt: 1.25, display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            component="button"
            type="button"
            onClick={onClick}
            disabled={!onClick}
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

