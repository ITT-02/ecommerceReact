// Página administrativa: Categorías.

import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import {useCategories} from '../../../hooks/catalog/useCategories';
import { useState, useMemo } from 'react';

export const CategoriesPage = () => {
    const { categories, loading } = useCategories();
    const [searchValue, setSearchValue] = useState('');
    const [filterValues, setFilterValues] = useState({});
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filteredCategories = useMemo(() => {
        return categories.filter((category) => 
            category.nombre.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [categories, searchValue]);

    const visibleRows = filteredCategories.slice(
        (pageNumber - 1) * pageSize,
        pageNumber * pageSize
    );

    return (
        <>
            <PlaceholderPage title="Categorías" description="Gestiona categorías principales." >
                <AdminResourceTable
                    rows={visibleRows}
                    columns={[
                        { field: 'orden_visual', headerName: 'Orden' },
                        { field: 'nombre', headerName: 'Nombre' },
                        { field: 'descripcion', headerName: 'Descripción' },
                        { field: 'slug', headerName: 'Slug' },
                        {
                            id: 'categoria_padre',
                            headerName: 'Categoría padre',
                            renderCell: (row) => row.categoria_padre?.nombre ?? 'Principal',
                        },
                    ]}   
                    actions={[]}
                    loading={loading}
                    pagination={{
                        pageNumber: pageNumber,
                        pageSize: pageSize,
                        totalCount: filteredCategories.length,
                        totalPages: Math.ceil(filteredCategories.length / pageSize),
                    }}
                    searchValue={searchValue}
                    searchLabel="Buscar categorías..."
                    filterValues={filterValues}
                    filters={[]}
                    onSearchChange={setSearchValue}
                    onFilterChange={(name, value) => {
                        setFilterValues((prev) => ({ ...prev, [name]: value }));
                    }}
                    onResetFilters={() => {
                        setSearchValue('');
                        setFilterValues({});
                    }}
                    onPageChange={setPageNumber}
                    onPageSizeChange={setPageSize}
                    primaryActionLabel="Crear categoría"
                    onPrimaryAction={() => {}}
                    emptyTitle="No hay categorías"
                    emptyDescription="Crea tu primera categoría para organizar tus productos."
                /> 
            </PlaceholderPage> 
        </>
    );
};
