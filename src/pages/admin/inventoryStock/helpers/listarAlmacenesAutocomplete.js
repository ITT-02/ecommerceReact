import { restApi } from '../../../../api/restApi';

// Helper simple para cargar almacenes para el filtro.
// Debe consultar GET /almacenes con:
// select=id,nombre
// es_activo=eq.true
// order=nombre.asc
// nombre=ilike.texto (cuando hay búsqueda)
export const listarAlmacenesAutocomplete = async ({ query = '' } = {}) => {
  const response = await restApi.get('/almacenes', {
    params: {
      select: 'id,nombre',
      es_activo: 'eq.true',
      order: 'nombre.asc',
      ...(query ? { nombre: `ilike.${query}` } : {}),
    },
  });

  return response.data ?? [];
};

