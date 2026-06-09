import { restApi } from '../../api/restApi';

export const getMyCommercialRequestsStatus = async () => {
  const response = await restApi.post('/rpc/obtener_mis_solicitudes_comerciales', {});
  const value = Array.isArray(response.data) ? response.data[0] : response.data;

  return {
    perfil: value?.perfil ?? {},
    mayorista: value?.mayorista ?? null,
    socioComercial: value?.socio_comercial ?? null,
    esMayoristaAprobado: Boolean(value?.es_mayorista_aprobado),
    esSocioComercialAprobado: Boolean(value?.es_socio_comercial_aprobado),
  };
};
