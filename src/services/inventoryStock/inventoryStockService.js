// src/services/inventoryStockService.js
import { restApi } from '../../api/restApi';

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
    p_stock_bajo: stockBajo === null || stockBajo === '' 
      ? null 
      : (stockBajo === true || stockBajo === 'true'),
  });

  return response.data;
};

export const listarMovimientosInventarioPaginado = async ({
  varianteId,
  almacenId,
  pageNumber = 1,
  pageSize = 10,
} = {}) => {
  const response = await restApi.post('/rpc/listar_movimientos_inventario_paginado', {
    p_variante_id: varianteId,
    p_almacen_id: almacenId,
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: '',
    p_tipo_movimiento: null,
  });

  return response.data;
};

// ✅ CORREGIDO: Solo permite ajustes, fuerza tipo='ajuste'
export const registrarAjusteStock = async ({
  varianteId,
  almacenId,
  nuevoStockFinal,
  referenciaTipo,
  notas,
} = {}) => {
  const response = await restApi.post('/rpc/registrar_movimiento_inventario', {
    p_variante_id: varianteId,
    p_almacen_id: almacenId,
    p_tipo_movimiento: 'ajuste',  // ← FORZADO
    p_cantidad: Number(nuevoStockFinal),
    p_notas: notas || null,
    p_referencia_tipo: referenciaTipo || 'conteo_fisico',
    p_referencia_id: null,
  });

  return response.data;
};