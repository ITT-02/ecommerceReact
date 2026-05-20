import { Box, Grid } from '@mui/material';

import { DashboardFilters } from './components/DashboardFilters';
import { DashboardSummary } from './components/DashboardSummary';
import { PedidosEstadoTable } from './components/PedidosEstadoTable';
import { PagosEstadoTable } from './components/PagosEstadoTable';
import { InventarioCriticoTable } from './components/InventarioCriticoTable';
import { UltimosPedidosTable } from './components/UltimosPedidosTable';
import { MovimientosRecientesTable } from './components/MovimientosRecientesTable';
import { DashboardSection } from './components/DashboardSection';

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
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
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

      <DashboardSummary resumen={resumen} />

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <DashboardSection title="Pedidos por estado">
              <PedidosEstadoTable pedidosPorEstado={pedidosPorEstado} />
            </DashboardSection>
          </Grid>

          <Grid item xs={12} md={6}>
            <DashboardSection title="Pagos por estado">
              <PagosEstadoTable pagosPorEstado={pagosPorEstado} />
            </DashboardSection>
          </Grid>

          <Grid item xs={12} md={6}>
            <DashboardSection title="Inventario crítico">
              <InventarioCriticoTable inventarioCritico={inventarioCritico} />
            </DashboardSection>
          </Grid>

          <Grid item xs={12} md={6}>
            <DashboardSection title="Últimos pedidos">
              <UltimosPedidosTable ultimosPedidos={ultimosPedidos} />
            </DashboardSection>
          </Grid>

          <Grid item xs={12}>
            <DashboardSection title="Movimientos recientes">
              <MovimientosRecientesTable movimientosRecientes={movimientosRecientes} />
            </DashboardSection>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

