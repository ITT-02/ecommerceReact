// Servicio para Inventario actual (NO CRUD)

import { restApi } from '../../api/restApi';

/**
 * Lista inventario paginado.
 * POST /rpc/listar_inventario_paginado
 */
export const listarInventarioPaginado = async ({
  pageNumber,
  pageSize,
  search,
  almacenId,
  stockBajo,
} = {}) => {
  const response = await restApi.post('/rpc/listar_inventario_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search,
    p_almacen_id: almacenId || null,
    p_stock_bajo: stockBajo ?? null,
  });

  return response.data;
};

/**
 * Lista movimientos paginados para una variante y almacén.
 * POST /rpc/listar_movimientos_inventario_paginado
 */
export const listarMovimientosInventarioPaginado = async ({
  varianteId,
  almacenId,
  pageNumber = 1,
  pageSize = 10,
} = {}) => {
  // Nota: el spec del usuario no incluye pageNumber/pageSize en el body.
  // Si el backend los ignora, no afecta. Si los requiere, se soportan.
  const response = await restApi.post('/rpc/listar_movimientos_inventario_paginado', {
    p_variante_id: varianteId,
    p_almacen_id: almacenId,
    p_page_number: pageNumber,
    p_page_size: pageSize,
  });

  return response.data;
};

/**
 * Registrar movimiento de inventario (ajuste).
 * Backend crea el movimiento y actualiza el inventario.
 */
export const registrarMovimientoInventario = async ({
  varianteId,
  almacenId,
  tipoMovimiento,
  cantidad,
  notas,
  referenciaTipo,
  referenciaId,
} = {}) => {
  const response = await restApi.post('/rpc/registrar_movimiento_inventario', {
    p_variante_id: varianteId,
    p_almacen_id: almacenId,
    p_tipo_movimiento: tipoMovimiento,
    p_cantidad: cantidad,
    p_notas: notas || null,
    p_referencia_tipo: referenciaTipo,
    p_referencia_id: referenciaId ?? null,
  });

  return response.data;
};

