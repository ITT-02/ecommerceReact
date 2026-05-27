// Tarjeta de indicador para dashboard administrativo.

import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CreditCardOffIcon from '@mui/icons-material/CreditCardOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const getKpiMeta = (title) => {
  const t = String(title ?? '');

  switch (t) {
    case 'Ventas total':
      return {
        icon: AttachMoneyIcon,
        tone: 'success',
        secondaryText: 'Ingresos del periodo',
      };
    case 'Pedidos total':
      return {
        icon: ShoppingCartIcon,
        tone: 'info',
        secondaryText: 'Volumen de órdenes',
      };
    case 'Pedidos pendientes':
      return {
        icon: PendingActionsIcon,
        tone: 'warning',
        secondaryText: 'Por procesar',
      };
    case 'Pagos pendientes':
      return {
        icon: CreditCardOffIcon,
        tone: 'warning',
        secondaryText: 'Requiere confirmación',
      };
    case 'Pagos aprobados':
      return {
        icon: CheckCircleIcon,
        tone: 'success',
        secondaryText: 'Confirmados',
      };
    case 'Pagos rechazados':
      return {
        icon: CancelIcon,
        tone: 'error',
        secondaryText: 'Fallidos / rechazados',
      };
    case 'Stock bajo':
      return {
        icon: Inventory2Icon,
        tone: 'warning',
        secondaryText: 'Requiere reposición',
      };
    case 'Promociones activas':
      return {
        icon: LocalOfferIcon,
        tone: 'info',
        secondaryText: 'En catálogo',
      };
    default:
      return {
        icon: AttachMoneyIcon,
        tone: 'info',
        secondaryText: '',
      };
  }
};

export const AdminStatsCard = ({ title, value }) => {
  const numericValue = typeof value === 'number' ? value : Number(value);

  const { icon: KpiIcon, tone, secondaryText } = getKpiMeta(title);

  const isFiniteNumber = Number.isFinite(numericValue);
  const displayValue = isFiniteNumber ? numericValue : 0;

  return (
    <Card
      elevation={0}
      sx={(theme) => ({
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: theme.shadows[1],
        transition: theme.transitions.create(['box-shadow'], { duration: 180 }),
        height: 118,
        display: 'flex',
        '&:hover': {
          boxShadow: theme.shadows[2],
        },
      })}
    >
      <CardContent
        sx={(theme) => ({
          p: 2,
          width: '100%',
          height: '100%',
          '&:last-child': { pb: 2 },
        })}
      >
        <Stack
          direction="row"
          spacing={1.75}
          alignItems="center"
          sx={{ height: '100%' }}
        >
          {/* Línea vertical izquierda (más fina) */}
          <Box
            sx={(theme) => {
              const tonePalette = theme.palette[tone] ?? theme.palette.info;
              return {
                width: 3,
                height: 54,
                borderRadius: 999,
                bgcolor: tonePalette.main,
                boxShadow: `0 0 0 3px ${theme.palette.action?.selected ?? 'transparent'}`,
                flexShrink: 0,
              };
            }}
          />

          {/* Icono en contenedor */}
          <Box
            sx={(theme) => {
              const tonePalette = theme.palette[tone] ?? theme.palette.info;
              return {
                width: 44,
                height: 44,
                borderRadius: 14,
                display: 'grid',
                placeItems: 'center',
                bgcolor: (theme) => theme.palette[tone]?.light ?? tonePalette.main,
                opacity: 0.16,
                border: '1px solid',
                borderColor: 'divider',
                flexShrink: 0,
              };
            }}
          >
            <KpiIcon
              sx={(theme) => {
                const tonePalette = theme.palette[tone] ?? theme.palette.info;
                return {
                  fontSize: 21,
                  color: tonePalette.main,
                };
              }}
            />
          </Box>

          {/* Contenido */}
          <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 800,
                letterSpacing: 0.2,
                mb: secondaryText ? 0.35 : 0,
                lineHeight: 1.2,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              sx={(theme) => {
                const tonePalette = theme.palette[tone] ?? theme.palette.info;
                return {
                  fontWeight: 900,
                  lineHeight: 1.05,
                  color: tonePalette.main,
                  wordBreak: 'break-word',
                };
              }}
            >
              {displayValue}
            </Typography>

            <Box sx={{ height: 18, overflow: 'hidden' }}>
              {secondaryText ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.15, lineHeight: 1.2 }}>
                  {secondaryText}
                </Typography>
              ) : null}
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};


