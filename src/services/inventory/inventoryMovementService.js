import { restApi } from '../../api/restApi';

export const inventoryMovementService = {
  getMovements: async ({
    pageNumber = 1,
    pageSize = 10,
    search = '',
    tipoMovimiento = null,
    fechaInicio = null,
    fechaFin = null,
  }) => {
    const { data } = await restApi.post('/rpc/listar_movimientos_inventario_paginado', {
      p_page_number: pageNumber,
      p_page_size: pageSize,
      p_search: search || '',
      p_tipo_movimiento: tipoMovimiento || null,
      p_variante_id: null,
      p_almacen_id: null,
      p_fecha_inicio: fechaInicio || null,
      p_fecha_fin: fechaFin || null,
    });

    return data;
  },

  registerMovement: async (form) => {
    const { data } = await restApi.post('/rpc/registrar_movimiento_inventario', {
      p_variante_id: form.variante_id,
      p_almacen_id: form.almacen_id,
      p_tipo_movimiento: form.tipo_movimiento,
      p_cantidad: Number(form.cantidad),
      p_notas: form.notas || '',
      p_referencia_tipo: form.referencia_tipo,
      p_referencia_id: null,
    });

    return data;
  },

  cancelMovement: async ({ movimientoId, motivoAnulacion }) => {
    const { data } = await restApi.post('/rpc/anular_movimiento_inventario', {
      p_movimiento_id: movimientoId,
      p_motivo_anulacion: motivoAnulacion,
    });

    return data;
  },

  getVariantOptions: async (search = '') => {
    const { data } = await restApi.post('/rpc/listar_variantes_con_atributos_paginado', {
      p_page_number: 1,
      p_page_size: 20,
      p_search: search,
      p_producto_id: null,
      p_es_activa: true,
    });

    return data?.items || [];
  },

  getWarehouseOptions: async (search = '') => {
    const params = new URLSearchParams({
      select: 'id,nombre',
      es_activo: 'eq.true',
      order: 'nombre.asc',
    });

    if (search) {
      params.append('nombre', `ilike.*${search}*`);
    }

    const { data } = await restApi.get(`/almacenes?${params.toString()}`);
    return data;
  },
};
