import { restApi } from '../../api/restApi';

export const inventoryMovementService = {
  // 1. Listar movimientos paginados
  getMovements: async ({ pageNumber = 1, pageSize = 10, search = '', tipoMovimiento = null }) => {
    const { data } = await restApi.post('/rpc/listar_movimientos_inventario_paginado', {
      p_page_number: pageNumber,
      p_page_size: pageSize,
      p_search: search || '',
      p_tipo_movimiento: tipoMovimiento || null,
      p_variante_id: null, // Dejamos estos dos nulos que por ahora no se usan
      p_almacen_id: null
    });
    return data;
  },

  // 2. Registrar movimiento
  registerMovement: async (form) => {
    const { data } = await restApi.post('/rpc/registrar_movimiento_inventario', {
      p_variante_id: form.variante_id,
      p_almacen_id: form.almacen_id,
      p_tipo_movimiento: form.tipo_movimiento,
      p_cantidad: Number(form.cantidad),
      p_notas: form.notas || '',
      p_referencia_tipo: form.referencia_tipo,
      p_referencia_id: null // Tal como exige tu regla (siempre null en este módulo manual)
    });
    return data;
  },

  // 3. Anular movimiento
  cancelMovement: async ({ movimientoId, motivoAnulacion }) => {
    const { data } = await restApi.post('/rpc/anular_movimiento_inventario', {
      p_movimiento_id: movimientoId,
      p_motivo_anulacion: motivoAnulacion
    });
    return data;
  },

  // 4. Select buscable de variantes 
  getVariantOptions: async (search = '') => {
    const { data } = await restApi.post('/rpc/listar_variantes_con_atributos_paginado', {
      p_page_number: 1,
      p_page_size: 20, // Tu README indica traer 20 para el autocomplete
      p_search: search,
      p_producto_id: null,
      p_es_activa: true
    });
    // Devolvemos solo los items que es lo que le interesa al Autocomplete
    return data?.items || [];
  },

  // 5. Select buscable de almacenes (por URL directa PGCrest)
  getWarehouseOptions: async (search = '') => {
    const params = new URLSearchParams({
      select: 'id,nombre',
      es_activo: 'eq.true',
      order: 'nombre.asc'
    });
    
    // Si hay parámetro texto/search de búsqueda, sumamos el filtro ilike
    if (search) {
      params.append('nombre', `ilike.*${search}*`);
    }

    const { data } = await restApi.get(`/almacenes?${params.toString()}`);
    return data;
  }
};