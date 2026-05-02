import { restApi } from "../../api/restApi";

export const atributoService = {
  getAtributosWithValores: async () => {
    const { data } = await restApi.get('/atributos_catalogo?select=*,atributo_valores(*)&order=nombre.asc');
    return data;
  },

  getAtributos: async () => {
    const { data } = await restApi.get('/atributos_catalogo?select=*&order=nombre.asc');
    return data;
  },

  createAtributo: async (atributoData) => {
    const { data } = await restApi.post('/atributos_catalogo?select=*', atributoData, {
      headers: { Prefer: 'return=representation' },
    });
    // PostgREST con return=representation devuelve un arreglo con el objeto creado
    return Array.isArray(data) ? data[0] : data;
  },

  updateAtributo: async (id, atributoData) => {
    const { data } = await restApi.patch(`/atributos_catalogo?id=eq.${id}&select=*`, atributoData, {
      headers: { Prefer: 'return=representation' },
    });
    return Array.isArray(data) ? data[0] : data;
  },

  deleteAtributo: async (id) => {
    const { data } = await restApi.delete(`/atributos_catalogo?id=eq.${id}&select=*`, {
      headers: { Prefer: 'return=representation' },
    });
    return data; // Borra los valores en cascada automáticamente según tus tablas
  },

  getValoresByAtributoId: async (atributoId) => {
    const { data } = await restApi.get(`/atributo_valores?select=*&atributo_id=eq.${atributoId}&order=orden_visual.asc`);
    return data;
  },

  createValor: async (valorData) => {
    const { data } = await restApi.post('/atributo_valores?select=*', valorData, {
      headers: { Prefer: 'return=representation' },
    });
    return Array.isArray(data) ? data[0] : data;
  },

  updateValor: async (id, valorData) => {
    const { data } = await restApi.patch(`/atributo_valores?id=eq.${id}&select=*`, valorData, {
      headers: { Prefer: 'return=representation' },
    });
    return Array.isArray(data) ? data[0] : data;
  },

  deleteValor: async (id) => {
    const { data } = await restApi.delete(`/atributo_valores?id=eq.${id}&select=*`, {
      headers: { Prefer: 'return=representation' },
    });
    return data;
  },
};