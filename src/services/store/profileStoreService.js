import { restApi } from '../../api/restApi';
export const profileStoreService = {
  // --- PERFIL ---
  
  getMiPerfil: async () => {
    const { data } = await restApi.post('/rpc/obtener_mi_perfil');
    return data;
  },

  updateMiPerfil: async (profileData) => {
    const { data } = await restApi.post('/rpc/actualizar_mi_perfil', profileData);
    return data;
  },

  // --- DIRECCIONES ---

  getMisDirecciones: async () => {
    const { data } = await restApi.post('/rpc/listar_mis_direcciones');
    return data;
  },

  createMiDireccion: async (addressData) => {
    const { data } = await restApi.post('/rpc/crear_mi_direccion', addressData);
    return data;
  },

  updateMiDireccion: async (addressData) => {
    const { data } = await restApi.post('/rpc/actualizar_mi_direccion', addressData);
    return data;
  },

  marcarDireccionPrincipal: async (direccionId) => {
    const { data } = await restApi.post('/rpc/marcar_mi_direccion_principal', {
      p_direccion_id: direccionId
    });
    return data;
  },

  eliminarMiDireccion: async (direccionId) => {
    const { data } = await restApi.post('/rpc/eliminar_mi_direccion', {
      p_direccion_id: direccionId
    });
    return data;
  }
};