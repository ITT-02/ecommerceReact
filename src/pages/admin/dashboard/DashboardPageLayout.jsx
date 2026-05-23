import { Box, Grid } from '@mui/material';

import { DashboardFilters } from './components/DashboardFilters';
import { DashboardSummary } from './components/DashboardSummary';
import { PedidosEstadoTable } from './components/PedidosEstadoTable';
import { PagosEstadoTable } from './components/PagosEstadoTable';
import { InventarioCriticoCard } from './components/InventarioCriticoCard';
import { UltimosPedidosCard } from './components/UltimosPedidosCard';
import { MovimientosRecientesCard } from './components/MovimientosRecientesCard';

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
            <PedidosEstadoTable pedidosPorEstado={pedidosPorEstado} />
          </Grid>

          <Grid item xs={12} md={6}>
            <PagosEstadoTable pagosPorEstado={pagosPorEstado} />
          </Grid>

          <Grid item xs={12} md={6}>
            <InventarioCriticoCard inventarioCritico={inventarioCritico} />
          </Grid>

          <Grid item xs={12} md={6}>
            <UltimosPedidosCard ultimosPedidos={ultimosPedidos} />
          </Grid>

          <Grid item xs={12}>
            <MovimientosRecientesCard movimientosRecientes={movimientosRecientes} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};


