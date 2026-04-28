// Servicio para stock e inventario.

import { restApi } from '../../api/restApi';

export const getInventory = async () => {
  const response = await restApi.get('/inventario', {
    params: {
      select: '*,producto_variantes(*,productos(id,nombre)),almacenes(id,nombre,codigo)',
      order: 'updated_at.desc',
    },
  });
  return response.data;
};

export const getStockAlerts = async () => {
  const response = await restApi.get('/vw_alertas_stock', {
    params: { select: '*', order: 'producto_nombre.asc' },
  });
  return response.data;
};

export const registerInventoryMovement = async ({ varianteId, almacenId, tipoMovimiento, cantidad, notas }) => {
  const response = await restApi.post('/rpc/registrar_movimiento_inventario', {
    p_variante_id: varianteId,
    p_almacen_id: almacenId,
    p_tipo_movimiento: tipoMovimiento,
    p_cantidad: cantidad,
    p_notas: notas || null,
  });
  return response.data;
};
