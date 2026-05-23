import { Grid, Stack } from '@mui/material';
import { AdminStatsCard } from '../../../../components/admin/AdminStatsCard';

export const DashboardSummary = ({ resumen = {} }) => {
  const {
    ventas_total = 0,
    pedidos_total = 0,
    pedidos_pendientes = 0,
    pagos_pendientes = 0,
    pagos_aprobados = 0,
    pagos_rechazados = 0,
    stock_bajo = 0,
    promociones_activas = 0,
  } = resumen;

  const cards = [
    { title: 'Ventas total', value: ventas_total },
    { title: 'Pedidos total', value: pedidos_total },
    { title: 'Pedidos pendientes', value: pedidos_pendientes },
    { title: 'Pagos pendientes', value: pagos_pendientes },
    { title: 'Pagos aprobados', value: pagos_aprobados },
    { title: 'Pagos rechazados', value: pagos_rechazados },
    { title: 'Stock bajo', value: stock_bajo },
    { title: 'Promociones activas', value: promociones_activas },
  ];

  return (
    <Stack spacing={2}>
      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        {cards.map((c) => (
          <Grid key={c.title} size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
            <AdminStatsCard title={c.title} value={c.value ?? 0} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

