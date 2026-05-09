// Servicio para banners de la tienda.

import { restApi } from '../../api/restApi';
import { deleteFile } from '../filesService';

const BANNERS_BUCKET = 'banners'
const BANNERS_FOLDER = 'home'

const normalizePaginatedResponse = (data, pageNumber, pageSize) => {
  const value = Array.isArray(data) ? data[0] : data;
  const items = value?.items ?? value?.data ?? value?.registros ?? [];
  const totalCount = value?.totalCount ?? value?.total_count ?? value?.total ?? items.length;
  const currentPage = value?.pageNumber ?? value?.page_number ?? value?.pagina_actual ?? pageNumber;
  const currentPageSize = value?.pageSize ?? value?.page_size ?? value?.tamano_pagina ?? pageSize;
  const totalPages = value?.totalPages ?? value?.total_pages ?? Math.max(Math.ceil(totalCount / currentPageSize), 1);

  return {
    items,
    totalCount,
    pageNumber: currentPage,
    pageSize: currentPageSize,
    totalPages,
    hasPreviousPage: value?.hasPreviousPage ?? value?.has_previous_page ?? currentPage > 1,
    hasNextPage: value?.hasNextPage ?? value?.has_next_page ?? currentPage < totalPages,
  };
};

export const getBanners = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  esActivo = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_banners_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search || null,
    p_es_activo: esActivo,
  });

  return normalizePaginatedResponse(response.data, pageNumber, pageSize);
};

export const getBannerById = async (id) => {
  const response = await restApi.get('/banners_home', {
    params: { id: `eq.${id}`, select: '*', limit: 1 },
  });

  return response.data[0] || null;
};

export const createBanner = async (bannerData) => {
  const response = await restApi.post('/banners_home', bannerData, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};

export const updateBanner = async (id, bannerData) => {
  const response = await restApi.patch('/banners_home', bannerData, {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data[0] || null;
};

export const deleteBanner = async (id) => {
  const response = await restApi.delete('/banners_home', {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  let banner = getBannerById(id)
  if(banner.url_destino){
    await deleteFile({
      bucket : BANNERS_BUCKET,
      path: banner.url_destino,
    })
  }

  return response.data[0] || null;
};
