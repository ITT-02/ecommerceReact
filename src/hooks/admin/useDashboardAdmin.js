import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { dashboardAdminService } from '../../services/admin/dashboardAdminService';

const toQueryDates = ({ fechaInicio, fechaFin }) => ({
  p_fecha_inicio: fechaInicio || null,
  p_fecha_fin: fechaFin || null,
});

export const useDashboardAdmin = ({ fechaInicio, fechaFin, enabled = true } = {}) => {
  const { p_fecha_inicio, p_fecha_fin } = toQueryDates({
    fechaInicio,
    fechaFin,
  });

  return useQuery({
    queryKey: ['dashboardAdmin', p_fecha_inicio, p_fecha_fin],
    enabled,
    queryFn: () =>
      dashboardAdminService.getDashboardAdmin({
        p_fecha_inicio,
        p_fecha_fin,
      }),

    /**
     * Mantiene visible la información anterior mientras se consulta
     * el nuevo rango de fechas.
     */
    placeholderData: keepPreviousData,

    /**
     * Evita recargar demasiado seguido si el usuario vuelve
     * al mismo rango en poco tiempo.
     */
    staleTime: 30_000,

    retry: 1,
  });
};