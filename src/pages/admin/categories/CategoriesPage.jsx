// Página administrativa: Categorías.

import {
    Box,
    Typography,
    Stack,
    IconButton,
    Drawer,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EditIcon from '@mui/icons-material/Edit';

import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { CategoryModal } from '../../../components/admin/categories/CategoryModal';
import { useCategories } from '../../../hooks/catalog/useCategories';
import { useState, useMemo } from 'react';

export const CategoriesPage = () => {
    const { categories, loading, createCategory, updateCategory, deleteCategory, fetchSubcategories } = useCategories();

    const [searchValue, setSearchValue] = useState('');
    const [filterValues, setFilterValues] = useState({});
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [expandedIds, setExpandedIds] = useState(new Set());
    const [subcategoriesData, setSubcategoriesData] = useState({});

    const handleToggleExpand = async (category) => {
        const newExpandedIds = new Set(expandedIds);
        
        if (expandedIds.has(category.id)) {
            newExpandedIds.delete(category.id);
        } else {
            newExpandedIds.add(category.id);
            // Lazy loading: Traer de Supabase solo si no los tenemos
            if (!subcategoriesData[category.id]) {
                const subs = await fetchSubcategories(category.id);
                setSubcategoriesData(prev => ({ ...prev, [category.id]: subs }));
            }
        }
        setExpandedIds(newExpandedIds);
    };


    const filteredCategories = useMemo(() => {
        return categories.filter((category) => 
            category.nombre.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [categories, searchValue]);

    const visibleRows = filteredCategories.slice(
        (pageNumber - 1) * pageSize,
        pageNumber * pageSize
    );

    const displayRows = useMemo(() => {
        const rows = [];
        visibleRows.forEach((category) => {
            rows.push(category); // Añadimos al padre
            
            // Si está expandido, inyectamos sus subcategorías justo debajo
            if (expandedIds.has(category.id) && subcategoriesData[category.id]) {
                subcategoriesData[category.id].forEach((sub) => {
                    rows.push({
                        ...sub,
                        isSubcategory: true, // Bandera para estilo
                        parentId: category.id,
                        categoria_padre: { nombre: category.nombre },
                    });
                });
            }
        });
        return rows;
    }, [visibleRows, expandedIds, subcategoriesData]);

    const handleOpenEdit = (category = null) => {
        setSelectedCategory(category);
        setOpen(true);
    };

    const handleCloseEdit = () => {
        setOpen(false);
        setSelectedCategory(null);
    };

    const handleSaveCategory = async (categoryData) => {
        setIsLoading(true);
        try {
            if (categoryData.id) {
                // Editar: await updateCategory(categoryData.id, categoryData);
                await updateCategory({ id: categoryData.id, category: categoryData });
            } else {
                // Crear: await createCategory(categoryData);
                await createCategory(categoryData);
            }
            handleCloseEdit();
        } catch (error) {
            console.error('Error guardando categoría:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        setIsLoading(true);
        try {
            // await deleteCategory(categoryId);
            await deleteCategory(categoryId);
            handleCloseEdit();
        } catch (error) {
            console.error('Error eliminando categoría:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <PlaceholderPage title="Categorías" description="Gestiona categorías principales." >
                <AdminResourceTable
                    rows={displayRows}
                    columns={[
                        { field: 'orden_visual', headerName: 'Orden' },
                        { 
                            field: 'nombre', 
                            headerName: 'Nombre',
                            renderCell: (row) => (
                                <Box sx={{ 
                                    pl: row.isSubcategory ? 4 : 0, // Sangría para hijos
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 0.5 
                                }}>
                                    {/* ICONO SOLO PARA PADRES */}
                                    {!row.isSubcategory && (
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleToggleExpand(row)}
                                            sx={{ p: 0.5, color: '#333' }}
                                        >
                                            {expandedIds.has(row.id) ? (
                                                <KeyboardArrowUpIcon fontSize="small" /> 
                                            ) : (
                                                <AccountTreeIcon fontSize="small" />
                                            )}
                                        </IconButton>
                                    )}

                                    {/* SÍMBOLO SOLO PARA HIJOS */}
                                    {row.isSubcategory && (
                                        <Typography sx={{ color: '#aaa', fontSize: '0.8rem', mr: 1 }}>
                                            └─
                                        </Typography>
                                    )}

                                    <Typography sx={{ 
                                        fontWeight: row.isSubcategory ? 400 : 700, 
                                        fontSize: '0.9rem',
                                        color: '#333'
                                    }}>
                                        {row.nombre}
                                    </Typography>
                                </Box>
                            )
                        },
                        { field: 'descripcion', headerName: 'Descripción' },
                        { field: 'slug', headerName: 'Slug' },
                        {
                            id: 'categoria_padre',
                            headerName: 'Categoría padre',
                            renderCell: (row) => row.categoria_padre?.nombre ?? 'Principal',
                        },
                    ]}   
                    actions={[
                        {
                            icon: <EditIcon />,
                            label: 'Editar',
                            onClick: (row) => handleOpenEdit(row),
                        }
                    ]}
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
                    onPrimaryAction={() => handleOpenEdit()}
                    emptyTitle="No hay categorías"
                    emptyDescription="Crea tu primera categoría para organizar tus productos."
                />

                <CategoryModal
                    key={open ? selectedCategory?.id ?? 'new' : 'closed'}
                    open={open}
                    onClose={handleCloseEdit}
                    category={selectedCategory}
                    onSave={handleSaveCategory}
                    onDelete={handleDeleteCategory}
                    isLoading={isLoading}
                />
            </PlaceholderPage>
        </>
    );
};
