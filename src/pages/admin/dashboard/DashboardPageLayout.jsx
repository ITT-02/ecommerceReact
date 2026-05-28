import { Box, Grid, LinearProgress, Typography } from '@mui/material';

import { DashboardFilters } from './components/DashboardFilters';
import { DashboardSummary } from './components/DashboardSummary';
import {
  InventarioCriticoCard,
  MovimientosRecientesCard,
  PagosEstadoCard,
  PedidosEstadoCard,
  UltimosPedidosCard,
} from './components/DashboardCards';
import {
  DASHBOARD_DETAIL_ROUTES,
  buildDashboardDetailPath,
} from './components/dashboardRoutes';

export const DashboardPageLayout = ({
  fechaInicio,
  fechaFin,
  setFechaInicio,
  setFechaFin,
  onMesActual,
  onActualizar,
  isLoading,
  rangoInvalido,
  resumen,
  pedidosPorEstado,
  pagosPorEstado,
  inventarioCritico,
  ultimosPedidos,
  movimientosRecientes,
}) => {
  const detailState = {
    fromDashboard: true,
    fechaInicio,
    fechaFin,
  };

  const detailPaths = {
    orders: buildDashboardDetailPath(DASHBOARD_DETAIL_ROUTES.orders, {
      fechaInicio,
      fechaFin,
    }),
    payments: buildDashboardDetailPath(DASHBOARD_DETAIL_ROUTES.payments, {
      fechaInicio,
      fechaFin,
    }),
    inventory: buildDashboardDetailPath(DASHBOARD_DETAIL_ROUTES.inventory, {
      fechaInicio,
      fechaFin,
    }),
    inventoryMovements: buildDashboardDetailPath(
      DASHBOARD_DETAIL_ROUTES.inventoryMovements,
      {
        fechaInicio,
        fechaFin,
      }
    ),
  };

  return (
    <Box sx={{ width: '100%', minWidth: 0, color: 'text.primary' }}>
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Box
          sx={(theme) => ({
            position: 'relative',
            overflow: 'hidden',
            borderRadius: `${theme.palette.custom.radius.xl}px`,
            border: isLoading
              ? `1px solid ${theme.palette.primary.main}`
              : '1px solid transparent',
            transition: `border-color ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}`,
          })}
        >
          {isLoading && (
            <LinearProgress
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 2,
              }}
            />
          )}

          <DashboardFilters
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            onChange={({ fechaInicio: fi, fechaFin: ff }) => {
              setFechaInicio(fi);
              setFechaFin(ff);
            }}
            onMesActual={onMesActual}
            onActualizar={onActualizar}
            isLoading={isLoading}
            rangoInvalido={rangoInvalido}
          />
        </Box>

        {isLoading && (
          <Typography
            variant="caption"
            sx={(theme) => ({
              display: 'block',
              mt: 1,
              color: theme.palette.custom.semantic.form.captionColor,
              fontWeight: 700,
              letterSpacing: '0.04em',
            })}
          >
            Actualizando información del dashboard...
          </Typography>
        )}
      </Box>

      <Box
        sx={(theme) => ({
          opacity: isLoading ? 0.86 : 1,
          transition: `opacity ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}`,
        })}
      >
        <DashboardSummary resumen={resumen} />

        <Box sx={{ mt: { xs: 2, md: 3 } }}>
          <Grid
            container
            spacing={{ xs: 2, lg: 2.5, xl: 3 }}
            sx={{ alignItems: 'stretch' }}
          >
            <Grid size={{ xs: 12, md: 6, xl: 4 }} sx={{ display: 'flex' }}>
              <PedidosEstadoCard
                pedidosPorEstado={pedidosPorEstado}
                detailsPath={detailPaths.orders}
                detailsState={detailState}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }} sx={{ display: 'flex' }}>
              <PagosEstadoCard
                pagosPorEstado={pagosPorEstado}
                detailsPath={detailPaths.payments}
                detailsState={detailState}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }} sx={{ display: 'flex' }}>
              <InventarioCriticoCard
                inventarioCritico={inventarioCritico}
                detailsPath={detailPaths.inventory}
                detailsState={detailState}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }} sx={{ display: 'flex' }}>
              <UltimosPedidosCard
                ultimosPedidos={ultimosPedidos}
                detailsPath={detailPaths.orders}
                detailsState={detailState}
              />
            </Grid>

            <Grid size={{ xs: 12, xl: 8 }} sx={{ display: 'flex' }}>
              <MovimientosRecientesCard
                movimientosRecientes={movimientosRecientes}
                detailsPath={detailPaths.inventoryMovements}
                detailsState={detailState}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};