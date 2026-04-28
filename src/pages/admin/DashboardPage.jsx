// Dashboard administrativo.

import { Container, Grid } from '@mui/material';
import { AdminStatsCard } from '../../components/admin/AdminStatsCard';
import { LowStockAlert } from '../../components/admin/LowStockAlert';
import { PageHeader } from '../../components/common/PageHeader';
import { useInventory } from '../../hooks/inventory/useInventory';

export const DashboardPage = () => {
  const { alerts } = useInventory();

  return (
    <Container maxWidth="xl">
      <PageHeader title="Dashboard" description="Resumen general del sistema." />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}><AdminStatsCard title="Pedidos pendientes" value="0" /></Grid>
        <Grid size={{ xs: 12, md: 3 }}><AdminStatsCard title="Pagos por validar" value="0" /></Grid>
        <Grid size={{ xs: 12, md: 3 }}><AdminStatsCard title="Productos activos" value="0" /></Grid>
        <Grid size={{ xs: 12, md: 3 }}><AdminStatsCard title="Bajo stock" value={alerts.length} /></Grid>
        <Grid size={{ xs: 12 }}><LowStockAlert count={alerts.length} /></Grid>
      </Grid>
    </Container>
  );
};
