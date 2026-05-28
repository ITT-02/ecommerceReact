import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';

import { formatCurrency } from '../../../../utils/formatters';

const numberFormatter = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });

const metricConfig = {
  sales: { Icon: AttachMoneyRoundedIcon, tone: 'success', eyebrow: 'Ingresos' },
  orders: { Icon: ShoppingCartCheckoutRoundedIcon, tone: 'info', eyebrow: 'Pedidos' },
  pendingOrders: { Icon: PendingActionsRoundedIcon, tone: 'warning', eyebrow: 'Atención' },
  pendingPayments: { Icon: PaymentsRoundedIcon, tone: 'warning', eyebrow: 'Pagos' },
  approvedPayments: { Icon: TaskAltRoundedIcon, tone: 'success', eyebrow: 'Pagos' },
  rejectedPayments: { Icon: CancelRoundedIcon, tone: 'danger', eyebrow: 'Pagos' },
  stock: { Icon: Inventory2RoundedIcon, tone: 'warning', eyebrow: 'Inventario' },
  promotions: { Icon: LocalOfferRoundedIcon, tone: 'brand', eyebrow: 'Marketing' },
};

const getTone = (theme, toneKey) => {
  const tones = theme.palette.custom.semantic.entityTone;
  return tones[toneKey] ?? tones.neutral;
};

const normalizeNumber = (value) => {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatMetricValue = (value, type) => {
  const numericValue = normalizeNumber(value);
  return type === 'currency' ? formatCurrency(numericValue) : numberFormatter.format(numericValue);
};

const DashboardMetricCard = ({ title, value, type = 'number', variant = 'orders' }) => {
  const config = metricConfig[variant] ?? metricConfig.orders;
  const Icon = config.Icon;
  const formattedValue = formatMetricValue(value, type);

  return (
    <Card
      sx={(theme) => ({
        width: '100%',
        height: '100%',
        minHeight: { xs: 128, md: 136 },
        overflow: 'hidden',
        borderRadius: theme.palette.custom.radius.xs,
        borderColor: theme.palette.custom.semantic.border,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.palette.custom.shadows.sm,
      })}
    >
      <CardContent
        sx={{
          height: '100%',
          p: { xs: 2, md: 2.25 },
          '&:last-child': { pb: { xs: 2, md: 2.25 } },
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ height: '100%', minWidth: 0 }}>
          <Box
            aria-hidden="true"
            sx={(theme) => ({
              width: 4,
              borderRadius: theme.palette.custom.radius.pill,
              backgroundColor: getTone(theme, config.tone).fg,
              flexShrink: 0,
            })}
          />

          <Stack spacing={1.25} sx={{ minWidth: 0, flex: 1, justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1.25} sx={{ minWidth: 0, alignItems: 'flex-start' }}>
              <Box
                sx={(theme) => {
                  const tone = getTone(theme, config.tone);
                  return {
                    width: 44,
                    height: 44,
                    borderRadius: theme.palette.custom.radius.pill,
                    display: 'grid',
                    placeItems: 'center',
                    backgroundColor: tone.bg,
                    color: tone.fg,
                    border: '1px solid',
                    borderColor: tone.border,
                    flexShrink: 0,
                  };
                }}
              >
                <Icon sx={{ fontSize: 22, display: 'block' }} />
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={(theme) => ({
                    display: 'block',
                    mb: 0.25,
                    color: theme.palette.custom.semantic.form.captionColor,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  })}
                >
                  {config.eyebrow}
                </Typography>

                <Typography
                  variant="body2"
                  title={title}
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 700,
                    lineHeight: 1.25,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {title}
                </Typography>
              </Box>
            </Stack>

            <Typography
              variant="h4"
              title={formattedValue}
              sx={(theme) => ({
                minWidth: 0,
                color: theme.palette.custom.semantic.form.titleColor,
                fontWeight: 800,
                letterSpacing: '0.01em',
                lineHeight: 1.05,
                fontFamily: theme.typography.h4.fontFamily,
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              })}
            >
              {formattedValue}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export const DashboardSummary = ({ resumen = {} }) => {
  const cards = [
    { title: 'Ventas total', value: resumen.ventas_total, type: 'currency', variant: 'sales' },
    { title: 'Pedidos total', value: resumen.pedidos_total, variant: 'orders' },
    { title: 'Pedidos pendientes', value: resumen.pedidos_pendientes, variant: 'pendingOrders' },
    { title: 'Pagos pendientes', value: resumen.pagos_pendientes, variant: 'pendingPayments' },
    { title: 'Pagos aprobados', value: resumen.pagos_aprobados, variant: 'approvedPayments' },
    { title: 'Pagos rechazados', value: resumen.pagos_rechazados, variant: 'rejectedPayments' },
    { title: 'Stock bajo', value: resumen.stock_bajo, variant: 'stock' },
    { title: 'Promociones activas', value: resumen.promociones_activas, variant: 'promotions' },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 1.5, sm: 2, lg: 2.5 },
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
          xl: 'repeat(auto-fit, minmax(220px, 1fr))',
        },
        alignItems: 'stretch',
      }}
    >
      {cards.map((card) => (
        <DashboardMetricCard
          key={card.title}
          title={card.title}
          value={card.value ?? 0}
          type={card.type}
          variant={card.variant}
        />
      ))}
    </Box>
  );
};
