// Dashboard administrativo (solo lectura).

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
  const start = now.startOf('month');
  const end = now.endOf('month');

  return {
    startIso: start.format('YYYY-MM-DD'),
    endIso: end.format('YYYY-MM-DD'),
  };
};

export const DashboardPage = () => {
  const { startIso, endIso } = getCurrentMonthBounds();

  const [fechaInicio, setFechaInicio] = useState(startIso);
  const [fechaFin, setFechaFin] = useState(endIso);

  const calcularMesActual = () => {
    const { startIso: nextStartIso, endIso: nextEndIso } = getCurrentMonthBounds();
    setFechaInicio(nextStartIso);
    setFechaFin(nextEndIso);
  };

  const fechaInicioDayjs = useMemo(() => {
    if (!fechaInicio) return null;
    const d = dayjs(fechaInicio, 'YYYY-MM-DD', true);
    return d.isValid() ? d : null;
  }, [fechaInicio]);

  const fechaFinDayjs = useMemo(() => {
    if (!fechaFin) return null;
    const d = dayjs(fechaFin, 'YYYY-MM-DD', true);
    return d.isValid() ? d : null;
  }, [fechaFin]);

  const rangoInvalido = useMemo(() => {
    if (!fechaInicioDayjs || !fechaFinDayjs) return false;
    return fechaInicioDayjs.isAfter(fechaFinDayjs, 'day');
  }, [fechaInicioDayjs, fechaFinDayjs]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useDashboardAdmin({
    fechaInicio: rangoInvalido ? null : fechaInicio || null,
    fechaFin: rangoInvalido ? null : fechaFin || null,
    enabled: !rangoInvalido,
  });

  const payload = data ?? {};
  const {
    resumen,
    pedidos_por_estado,
    pagos_por_estado,
    inventario_critico,
    ultimos_pedidos,
    movimientos_recientes,
  } = payload;

  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <PageHeader title="Dashboard" description="Resumen general del sistema." />
        <LoadingScreen message="Cargando dashboard..." />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <PageHeader title="Dashboard" description="Resumen general del sistema." />
      <ErrorMessage message={error?.message} />

      <DashboardPageLayout
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        setFechaInicio={(v) => {
          setFechaInicio(v);
        }}
        setFechaFin={(v) => {
          setFechaFin(v);
        }}
        rangoInvalido={rangoInvalido}
        onMesActual={() => {
          calcularMesActual();
          // React Query ya refetch por queryKey; no forzamos refetch.
        }}
        onActualizar={() => {
          if (rangoInvalido) return;
          refetch();
        }}
        isLoading={isLoading}
        resumen={resumen ?? {}}
        pedidosPorEstado={pedidos_por_estado ?? []}
        pagosPorEstado={pagos_por_estado ?? []}
        inventarioCritico={inventario_critico ?? []}
        ultimosPedidos={ultimos_pedidos ?? []}
        movimientosRecientes={movimientos_recientes ?? []}
      />
    </Container>
  );
};

