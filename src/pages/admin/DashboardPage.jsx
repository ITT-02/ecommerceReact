// Dashboard administrativo de solo lectura.

import { Container } from '@mui/material';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';

import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PageHeader } from '../../components/common/PageHeader';
import { useDashboardAdmin } from '../../hooks/admin/useDashboardAdmin';

import { DashboardPageLayout } from './dashboard/DashboardPageLayout';

const getCurrentMonthBounds = () => {
  const now = dayjs();

  return {
    startIso: now.startOf('month').format('YYYY-MM-DD'),
    endIso: now.endOf('month').format('YYYY-MM-DD'),
  };
};

const dashboardContainerSx = {
  width: '100%',
  maxWidth: '100%',
  px: {
    xs: 2,
    sm: 2.5,
    md: 3,
    lg: 3.5,
    xl: 4,
  },
  color: 'text.primary',
};

export const DashboardPage = () => {
  const initialRange = useMemo(() => getCurrentMonthBounds(), []);

  /**
   * Fechas que el usuario escribe en los inputs.
   * Estas NO consultan automáticamente al backend.
   */
  const [fechaInicio, setFechaInicio] = useState(initialRange.startIso);
  const [fechaFin, setFechaFin] = useState(initialRange.endIso);

  /**
   * Fechas  aplicadas a la consulta.
   * Solo cambian al presionar "Actualizar" o "Mes actual".
   */
  const [appliedRange, setAppliedRange] = useState({
    fechaInicio: initialRange.startIso,
    fechaFin: initialRange.endIso,
  });

  const rangoInvalido = useMemo(() => {
    if (!fechaInicio || !fechaFin) return false;

    const start = dayjs(fechaInicio, 'YYYY-MM-DD', true);
    const end = dayjs(fechaFin, 'YYYY-MM-DD', true);

    if (!start.isValid() || !end.isValid()) return false;

    return start.isAfter(end, 'day');
  }, [fechaInicio, fechaFin]);

  const {
    data: dashboardData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useDashboardAdmin({
    fechaInicio: appliedRange.fechaInicio || null,
    fechaFin: appliedRange.fechaFin || null,
    enabled: true,
  });

  const data = dashboardData ?? {};

  const {
    resumen = {},
    pedidos_por_estado = [],
    pagos_por_estado = [],
    inventario_critico = [],
    ultimos_pedidos = [],
    movimientos_recientes = [],
  } = data;

  /**
   * Pantalla completa solo para la primera carga.
   * Luego, cuando se actualicen fechas, el dashboard queda visible.
   */
  const isInitialLoading = isLoading && !dashboardData;

  /**
   * Carga suave para comunicar que se están refrescando datos,
   * sin desmontar la pantalla completa.
   */
  const isUpdating = isFetching && !isInitialLoading;

  const calcularMesActual = () => {
    const { startIso, endIso } = getCurrentMonthBounds();

    setFechaInicio(startIso);
    setFechaFin(endIso);

    setAppliedRange({
      fechaInicio: startIso,
      fechaFin: endIso,
    });
  };

  const handleActualizar = () => {
    if (rangoInvalido) return;

    const nextRange = {
      fechaInicio: fechaInicio || null,
      fechaFin: fechaFin || null,
    };

    const isSameRange =
      appliedRange.fechaInicio === nextRange.fechaInicio &&
      appliedRange.fechaFin === nextRange.fechaFin;

    /**
     * Si el rango es igual, hacemos refetch manual.
     * Si cambió, actualizamos appliedRange y React Query consulta
     * con el nuevo queryKey.
     */
    if (isSameRange) {
      refetch();
      return;
    }

    setAppliedRange(nextRange);
  };

  if (isInitialLoading) {
    return (
      <Container maxWidth={false} sx={dashboardContainerSx}>
        <PageHeader title="Dashboard" description="Resumen general del sistema." />
        <LoadingScreen message="Cargando dashboard..." />
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={dashboardContainerSx}>
      <PageHeader title="Dashboard" description="Resumen general del sistema." />

      <ErrorMessage message={error?.message} />

      <DashboardPageLayout
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        setFechaInicio={setFechaInicio}
        setFechaFin={setFechaFin}
        rangoInvalido={rangoInvalido}
        onMesActual={calcularMesActual}
        onActualizar={handleActualizar}
        isLoading={isUpdating}
        resumen={resumen}
        pedidosPorEstado={pedidos_por_estado}
        pagosPorEstado={pagos_por_estado}
        inventarioCritico={inventario_critico}
        ultimosPedidos={ultimos_pedidos}
        movimientosRecientes={movimientos_recientes}
      />
    </Container>
  );
};