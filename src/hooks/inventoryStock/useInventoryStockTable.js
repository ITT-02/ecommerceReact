// src/hooks/inventoryStock/useInventoryStockTable.js
import { useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { listarInventarioPaginado } from '../../services/inventoryStock/inventoryStockService';


export const useInventoryStockTable = ({
  initialPageNumber = 1,
  initialPageSize = 10,
}) => {
  const [pageNumber, setPageNumber] = useState(initialPageNumber);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState('');
  const [almacenId, setAlmacenId] = useState(null);
  const [stockBajo, setStockBajo] = useState(null);

  // ✅ Query para listar inventario (SOLO LECTURA)
  const query = useQuery({
    queryKey: ['inventoryStock', pageNumber, pageSize, search, almacenId, stockBajo],
    queryFn: () => listarInventarioPaginado({
      pageNumber,
      pageSize,
      search,
      almacenId,
      stockBajo,
    }),
    placeholderData: keepPreviousData,
  });

  const pagination = useMemo(() => {
    const data = query.data;
    return {
      totalCount: data?.totalCount ?? 0,
      pageNumber: data?.pageNumber ?? pageNumber,
      pageSize: data?.pageSize ?? pageSize,
      totalPages: data?.totalPages ?? 0,
      hasPreviousPage: data?.hasPreviousPage ?? false,
      hasNextPage: data?.hasNextPage ?? false,
    };
  }, [query.data, pageNumber, pageSize]);

  return {
    // Datos
    rows: query.data?.items ?? [],
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error?.message ?? null,
    pagination,
    
    // Paginación
    pageNumber,
    pageSize,
    setPageNumber,
    setPageSize,
    
    // Filtros
    search,
    setSearch,
    almacenId,
    setAlmacenId,
    stockBajo,
    setStockBajo,
    
    // Acciones
    refetch: query.refetch,
  };
};