import { useState, useCallback, useEffect } from 'react';
import { atributoService } from "../../services/catalog/attributeService";

export const useAtributos = () => {
  const [atributos, setAtributos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para la paginación y filtros que pide la tabla nueva
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState({
    seUsaEnFiltro: "",
    seUsaEnVariantes: "",
    esObligatorio: ""
  });
  
  const [paginationData, setPaginationData] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  const fetchAtributos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await atributoService.getAtributosPaginado({
        pageNumber,
        pageSize,
        search: searchValue,
        ...filterValues
      });
      
      setAtributos(data.items || []);
      setPaginationData({
        totalCount: data.totalCount,
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        hasPreviousPage: data.hasPreviousPage,
        hasNextPage: data.hasNextPage
      });
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cargar los atributos');
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, searchValue, filterValues]);

  // Se recarga cada vez que cambias de página, tamaño o filtros
  useEffect(() => {
    fetchAtributos();
  }, [fetchAtributos]);

  const handleSearchChange = (val) => { setSearchValue(val); setPageNumber(1); };
  const handleFilterChange = (key, val) => { setFilterValues(prev => ({...prev, [key]: val})); setPageNumber(1); };
  const handleResetFilters = () => { 
    setSearchValue(''); 
    setFilterValues({ seUsaEnFiltro: null, seUsaEnVariantes: null, esObligatorio: null }); 
    setPageNumber(1); 
  };
  const handlePageChange = (newPage) => setPageNumber(newPage);
  const handlePageSizeChange = (newSize) => { setPageSize(newSize); setPageNumber(1); };

  const create = async (datos) => {
    await atributoService.createAtributo(datos);
    await fetchAtributos(); // Recargamos de la BD para la estructura nueva
  };

  const update = async (id, datos) => {
    await atributoService.updateAtributo(id, datos);
    await fetchAtributos(); // Recargamos de la BD para la estructura nueva
  };

  const remove = async (id) => {
    await atributoService.deleteAtributo(id);
    await fetchAtributos();
  };

  return { 
    atributos, 
    loading, 
    error, 
    
    // Lo nuevo que pide tu AdminResourceTable:
    pagination: paginationData,
    searchValue,
    filterValues,
    onSearchChange: handleSearchChange,
    onFilterChange: handleFilterChange,
    onResetFilters: handleResetFilters,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,

    create, 
    update, 
    remove,
    fetchAtributos // Se exporta por si necesitas forzar la carga
  };
};