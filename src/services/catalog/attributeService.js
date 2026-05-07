import { restApi } from "../../api/restApi";

export const atributoService = {
  // --- NUEVOS ENDPOINTS PAGINADOS (según la guía) ---
  getAtributosPaginado: async (params) => {
    const payload = {
      p_page_number: params.pageNumber || 1,
      p_page_size: params.pageSize || 10,
      p_search: params.search || '',
      p_se_usa_en_filtro: params.seUsaEnFiltro ?? null,
      p_se_usa_en_variantes: params.seUsaEnVariantes ?? null,
      p_es_obligatorio: params.esObligatorio ?? null
    };
    const { data } = await restApi.post('/rpc/listar_atributos_paginado', payload);
    return data;
  },

  getAtributoValoresPaginado: async (params) => {
    const payload = {
      p_page_number: params.pageNumber || 1,
      p_page_size: params.pageSize || 10,
      p_search: params.search || '',
      p_atributo_id: params.atributoId,
      p_es_activo: params.esActivo ?? null
    };
    const { data } = await restApi.post('/rpc/listar_atributo_valores_paginado', payload);
    return data;
  },

  // --- LAS FUNCIONES ANTERIORES SE MANTIENEN IGUAL ---
  getAtributosWithValores: async () => {
    const { data } = await restApi.get('/atributos_catalogo?select=*,atributo_valores(*)&order=nombre.asc');
    return data;
  },
  
  getAtributos: async () => {
    const { data } = await restApi.get('/atributos_catalogo?select=*&order=nombre.asc');
    return data;
  },
  
  createAtributo: async (atributoData) => {
    const { data } = await restApi.post('/atributos_catalogo?select=*', atributoData, { headers: { Prefer: 'return=representation' } });
    return Array.isArray(data) ? data[0] : data;
  },
  updateAtributo: async (id, atributoData) => {
    const { data } = await restApi.patch(`/atributos_catalogo?id=eq.${id}&select=*`, atributoData, { headers: { Prefer: 'return=representation' } });
    return Array.isArray(data) ? data[0] : data;
  },
  deleteAtributo: async (id) => {
    const { data } = await restApi.delete(`/atributos_catalogo?id=eq.${id}&select=*`, { headers: { Prefer: 'return=representation' } });
    return data;
  },
  getValoresByAtributoId: async (atributoId) => {
    const { data } = await restApi.get(`/atributo_valores?select=*&atributo_id=eq.${atributoId}&order=orden_visual.asc`);
    return data;
  },
  createValor: async (valorData) => {
    const { data } = await restApi.post('/atributo_valores?select=*', valorData, { headers: { Prefer: 'return=representation' } });
    return Array.isArray(data) ? data[0] : data;
  },
  updateValor: async (id, valorData) => {
    const { data } = await restApi.patch(`/atributo_valores?id=eq.${id}&select=*`, valorData, { headers: { Prefer: 'return=representation' } });
    return Array.isArray(data) ? data[0] : data;
  },
  deleteValor: async (id) => {
    const { data } = await restApi.delete(`/atributo_valores?id=eq.${id}&select=*`, { headers: { Prefer: 'return=representation' } });
    return data;
  }
};