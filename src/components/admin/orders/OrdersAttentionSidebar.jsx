// Panel lateral de atención para pedidos.
// Muestra indicadores operativos y permite filtrar la tabla.

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export const ORDER_ATTENTION_GROUPS = [
  {
    key: 'pago_validando',
    label: 'Validar pagos',
    helper: 'Comprobantes por revisar',
    icon: <PaymentsOutlinedIcon fontSize="small" />,
    filters: { estadoPago: 'validando' },
  },
  {
    key: 'pago_vencido',
    label: 'Pagos vencidos',
    helper: 'Pedidos que requieren cierre o revisión',
    icon: <WarningAmberRoundedIcon fontSize="small" />,
    filters: { estadoPago: 'vencido' },
  },
  {
    key: 'en_preparacion',
    label: 'En preparación',
    helper: 'Pedidos que se están atendiendo',
    icon: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
    filters: { estadoPedido: 'en_preparacion' },
  },
  {
    key: 'confirmado',
    label: 'Confirmados',
    helper: 'Listos para iniciar preparación',
    icon: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
    filters: { estadoPedido: 'confirmado' },
  },
  {
    key: 'listo_para_envio',
    label: 'Listos para despacho',
    helper: 'Pendientes de entrega o transportista',
    icon: <LocalShippingOutlinedIcon fontSize="small" />,
    filters: { estadoPedido: 'listo_para_envio' },
  },
  {
    key: 'pago_rechazado',
    label: 'Pagos rechazados',
    helper: 'Requieren comunicación o nuevo comprobante',
    icon: <WarningAmberRoundedIcon fontSize="small" />,
    filters: { estadoPago: 'rechazado' },
  },
];

export const OrdersAttentionSidebar = ({
  activeKey = '',
  summaryTotals = {},
  loading = false,
  onApplyFilter,
  onClearFilter,
}) => {
  return (
    <Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: { lg: 88 } }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="subtitle2" fontWeight={900}>
                Atención rápida
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Selecciona un estado para mostrar esos pedidos en la tabla.
              </Typography>
            </Box>

            <Stack spacing={1}>
              {ORDER_ATTENTION_GROUPS.map((group) => {
                const isActive = activeKey === group.key;
                const total = Number(summaryTotals[group.key] ?? 0);

                return (
                  <Button
                    key={group.key}
                    variant={isActive ? 'contained' : 'outlined'}
                    onClick={() => onApplyFilter?.(group)}
                    startIcon={group.icon}
                    sx={{
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      borderRadius: 2,
                      py: 1,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle3" sx={{
                        fontWeight: 800,
                        color: 'secondary.main',
                      }}>
                        {group.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={isActive ? 'info' : 'text.secondary'}
                        sx={{ display: 'block' }}
                      >
                        {group.helper}
                      </Typography>
                    </Box>

                    {loading ? (
                      <Skeleton variant="rounded" width={34} height={24} />
                    ) : (
                      <Chip
                        size="small"
                        label={total}
                        color={isActive ? 'info' : 'primary'}
                        variant={isActive ? 'filled' : 'outlined'}
                      />
                    )}
                  </Button>
                );
              })}
            </Stack>

            {activeKey && (
              <Button variant="text" onClick={onClearFilter} sx={{ alignSelf: 'flex-start' }}>
                Ver todos los pedidos
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
