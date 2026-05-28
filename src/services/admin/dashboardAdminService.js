import { restApi } from '../../api/restApi';

export const dashboardAdminService = {
  getDashboardAdmin: async ({ p_fecha_inicio = null, p_fecha_fin = null } = {}) => {
    const response = await restApi.post('/rpc/obtener_dashboard_admin', {
      p_fecha_inicio: p_fecha_inicio ?? null,
      p_fecha_fin: p_fecha_fin ?? null,
    });

    return response.data;
  },
};
