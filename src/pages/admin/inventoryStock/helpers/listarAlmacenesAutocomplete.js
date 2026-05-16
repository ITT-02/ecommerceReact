import { restApi } from '../../../../api/restApi';

export const listarAlmacenesAutocomplete = async ({ query = '' } = {}) => {
  const response = await restApi.get('/almacenes', {
    params: {
      select: 'id,nombre',
      es_activo: 'eq.true',
      order: 'nombre.asc',
      ...(query ? { nombre: `ilike.*${query}*` } : {}),
    },
  });
  return response.data ?? [];
};