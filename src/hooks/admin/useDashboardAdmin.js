import { useQuery } from '@tanstack/react-query';
import { dashboardAdminService } from '../../services/admin/dashboardAdminService';

const toQueryDates = ({ fechaInicio, fechaFin }) => {
  const p_fecha_inicio = fechaInicio ? fechaInicio : null;
  const p_fecha_fin = fechaFin ? fechaFin : null;

  return { p_fecha_inicio, p_fecha_fin };
};

export const useDashboardAdmin = ({ fechaInicio, fechaFin, enabled = true } = {}) => {
  const { p_fecha_inicio, p_fecha_fin } = toQueryDates({ fechaInicio, fechaFin });

  return useQuery({
    queryKey: ['dashboardAdmin', p_fecha_inicio, p_fecha_fin],
    enabled,
    queryFn: async () => {
      const data = await dashboardAdminService.getDashboardAdmin({
        p_fecha_inicio,
        p_fecha_fin,
      });

      // Validación inicial de estructura del backend
      // (requisito del flujo)
      // eslint-disable-next-line no-console
      console.log('obtener_dashboard_admin response:', data);

      return data;
    },
    staleTime: 30_000,
    retry: 1,
  });
};

