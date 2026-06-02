// Dashboard administrativo de solo lectura.

import { Container } from '@mui/material';
import { useMemo, useState } from 'react';

import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PageHeader } from '../../components/common/PageHeader';
import { useDashboardAdmin } from '../../hooks/admin/useDashboardAdmin';
import {
  getDefaultAdminDateRange,
  isDateRangeInvalid,
} from '../../utils/defaultDateRange';

import { DashboardPageLayout } from './dashboard/DashboardPageLayout';

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
  const initialRange = useMemo(() => getDefaultAdminDateRange(), []);

  /**
   * Fechas que el usuario escribe en los inputs.
   * Estas NO consultan automáticamente al backend.
   */
  const [fechaInicio, setFechaInicio] = useState(initialRange.fechaInicio);
  const [fechaFin, setFechaFin] = useState(initialRange.fechaFin);

  /**
   * Fechas aplicadas a la consulta.
   * Solo cambian al presionar "Actualizar" o "Rango inicial".
   */
  const [appliedRange, setAppliedRange] = useState(initialRange);

  const rangoInvalido = useMemo(() => {
    return isDateRangeInvalid({ fechaInicio, fechaFin });
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

  const isInitialLoading = isLoading && !dashboardData;
  const isUpdating = isFetching && !isInitialLoading;

  const aplicarRangoInicial = () => {
    const nextRange = getDefaultAdminDateRange();

    setFechaInicio(nextRange.fechaInicio);
    setFechaFin(nextRange.fechaFin);
    setAppliedRange(nextRange);
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
        onMesActual={aplicarRangoInicial}
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
