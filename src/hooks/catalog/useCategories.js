// Hook para categorías y subcategorías.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCategory, deleteCategory, getCategories, getSubcategories, updateCategory } from '../../services/catalog/categoryService';

export const useCategories = () => {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const fetchSubcategories = async (parentId) => {
    // Primero revisamos si ya existen en la caché de React Query
    const existingData = queryClient.getQueryData(['categories', 'sub', parentId]);
    if (existingData) return existingData;

    // Si no están, las pedimos al servicio
    const data = await getSubcategories(parentId);
    
    // Las guardamos en caché para la próxima vez
    queryClient.setQueryData(['categories', 'sub', parentId], data);
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

  return {
    categories: categoriesQuery.data ?? [],
    loading: categoriesQuery.isLoading,
    fetchSubcategories,
    error: categoriesQuery.error?.message ?? null,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
  };
};
