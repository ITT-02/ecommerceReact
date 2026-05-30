import { restApi } from '../../api/restApi';
import { normalizePaginated } from '../admin/genericResourceService';

export const getProcurementOptions = async (search = '') => {
  const response = await restApi.post('/rpc/obtener_opciones_compras_admin', {
    p_search: search || null,
  });

  return {
    proveedores: response.data?.proveedores ?? [],
    almacenes: response.data?.almacenes ?? [],
    variantes: response.data?.variantes ?? [],
  };
};

export const getSuppliers = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  isActive = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_proveedores_admin_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search || null,
    p_es_activo: isActive === '' ? null : isActive,
  });

  return normalizePaginated(response.data, pageNumber, pageSize);
};

export const saveSupplier = async (supplier) => {
  const response = await restApi.post('/rpc/guardar_proveedor_admin', {
    p_proveedor: supplier,
  });

  return response.data;
};

export const getSupplierProducts = async (supplierId) => {
  if (!supplierId) return [];

  const response = await restApi.post('/rpc/listar_proveedor_productos_admin', {
    p_proveedor_id: supplierId,
  });

  return response.data ?? [];
};

export const saveSupplierProducts = async ({ supplierId, items }) => {
  const response = await restApi.post('/rpc/guardar_proveedor_productos_admin', {
    p_proveedor_id: supplierId,
    p_items: items,
  });

  return response.data ?? [];
};

export const getPurchaseOrders = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estado = '',
  proveedorId = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_ordenes_compra_admin_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search || null,
    p_estado: estado || null,
    p_proveedor_id: proveedorId || null,
  });

  return normalizePaginated(response.data, pageNumber, pageSize);
};

export const getPurchaseOrderDetail = async (purchaseOrderId) => {
  const response = await restApi.post('/rpc/obtener_orden_compra_admin_detalle', {
    p_orden_compra_id: purchaseOrderId,
  });

  return response.data;
};

export const savePurchaseOrder = async ({ order, items }) => {
  const response = await restApi.post('/rpc/guardar_orden_compra_admin', {
    p_orden: order,
    p_items: items,
  });

  return response.data;
};

export const changePurchaseOrderStatus = async ({ purchaseOrderId, estado, comentario }) => {
  const response = await restApi.post('/rpc/cambiar_estado_orden_compra_admin', {
    p_orden_compra_id: purchaseOrderId,
    p_estado_nuevo: estado,
    p_comentario: comentario || null,
  });

  return response.data;
};

export const getPurchaseOrdersPendingReception = async (search = '') => {
  const response = await restApi.post('/rpc/listar_ordenes_pendientes_recepcion_admin', {
    p_search: search || null,
  });

  return response.data ?? [];
};

export const getGoodsReceptions = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estado = '',
  proveedorId = null,
  almacenId = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_recepciones_mercaderia_admin_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search || null,
    p_estado: estado || null,
    p_proveedor_id: proveedorId || null,
    p_almacen_id: almacenId || null,
  });

  return normalizePaginated(response.data, pageNumber, pageSize);
};

export const getGoodsReceptionDetail = async (receptionId) => {
  const response = await restApi.post('/rpc/obtener_recepcion_mercaderia_admin_detalle', {
    p_recepcion_id: receptionId,
  });

  return response.data;
};

export const registerGoodsReception = async ({ reception, items }) => {
  const response = await restApi.post('/rpc/registrar_recepcion_mercaderia_admin', {
    p_recepcion: reception,
    p_items: items,
  });

  return response.data;
};


export const cancelGoodsReception = async ({ receptionId, motivoAnulacion }) => {
  const response = await restApi.post('/rpc/anular_recepcion_mercaderia_admin', {
    p_recepcion_id: receptionId,
    p_motivo_anulacion: motivoAnulacion,
  });

  return response.data;
};
