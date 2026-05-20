// Hook para categorías y subcategorías.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCategory,
  deleteCategory,
  getCategories,
  getSubcategories,
  updateCategory,
} from '../../services/catalog/categoryService';

export const useCategories = ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  esActiva = null,
  esVisible = null,
} = {}) => {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['categories', pageNumber, pageSize, search, esActiva, esVisible],
    queryFn: () =>
      getCategories({
        pageNumber,
        pageSize,
        search,
        esActiva,
        esVisible,
      }),
    placeholderData: (previousData) => previousData,
  });

  const fetchSubcategories = async (parentId, forceRefresh = false, search = '') => {
    const queryKey = ['categories', 'sub', parentId, search];
      // Primero revisamos si ya existen en la caché de React Query
    const existingData = queryClient.getQueryData(queryKey);

    if (existingData && !forceRefresh) return existingData;

      // Si no están o se fuerza actualización, las pedimos al servicio
    const data = await getSubcategories(parentId, search);

    // Las guardamos en caché para la próxima vez
    queryClient.setQueryData(queryKey, data);

    return data;
  };

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, category }) => updateCategory(id, category),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const paginatedData = categoriesQuery.data ?? {
    items: [],
    totalCount: 0,
    pageNumber,
    pageSize,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  return {
    categories: paginatedData.items,
    pagination: paginatedData,
    loading: categoriesQuery.isLoading,
    fetching: categoriesQuery.isFetching,
    fetchSubcategories,
    error: categoriesQuery.error?.message ?? null,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
  };
};