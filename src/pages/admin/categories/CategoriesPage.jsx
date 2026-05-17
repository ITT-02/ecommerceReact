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
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { useCategories } from '../../../hooks/catalog/useCategories';
import { mapFormDataToCategory } from '../../../adapters/categoriesMapper';
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
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

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
            const mappedCategory = await mapFormDataToCategory(categoryData);

            if (categoryData.id) {
                await updateCategory({ id: categoryData.id, category: mappedCategory });
            } else {
                await createCategory(mappedCategory);
            }
            handleCloseEdit();
        } catch (error) {
            console.error('Error guardando categoría:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async (category) => {
        setIsLoading(true);
        try {
            await deleteCategory(category);
            handleCloseEdit();
        } catch (error) {
            console.error('Error eliminando categoría:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDeleteConfirm = (row) => {
        setCategoryToDelete(row);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;
        setConfirmDeleteOpen(false);
        await handleDeleteCategory(categoryToDelete);
        setCategoryToDelete(null);
    };

    const handleCancelDelete = () => {
        setConfirmDeleteOpen(false);
        setCategoryToDelete(null);
    };

    return (
        <>
            <PlaceholderPage title="Categorías" description="Gestiona categorías principales." >
                <AdminResourceTable
                    rows={displayRows}
                    columns={[
                        {
                            field: 'orden_visual',
                            headerName: 'Orden',
                            width: 70,
                        },
                        {
                            field: 'imagen_url',
                            headerName: 'Imagen',
                            type: 'image',
                            imageSize: 48,
                            width: 90,
                        },
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
                                            sx={{ p: 0.5, color: 'primary' }}
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
                                        <Typography sx={{ color: 'primary', fontSize: '0.8rem', mr: 1 }}>
                                            └─
                                        </Typography>
                                    )}

                                    <Typography sx={{ 
                                        fontWeight: row.isSubcategory ? 400 : 700, 
                                        fontSize: '0.9rem'
                                    }}>
                                        {row.nombre}
                                    </Typography>
                                </Box>
                            )
                        },
                        {
                            field: 'descripcion',
                            headerName: 'Descripción' },
                        { field: 'slug', headerName: 'Slug'

                        },
                        {
                            field: 'categoria_padre_nombre',
                            headerName: 'Categoría padre',
                            renderCell: (row) => row.categoria_padre_nombre || 'Principal',
                        },
                    ]}   
                    actions={[
                        {
                            icon: <EditIcon />,
                            label: 'Editar',
                            onClick: (row) => handleOpenEdit(row),
                        },
                        {
                            type: 'delete',
                            label: 'Eliminar',
                            onClick: (row) => handleOpenDeleteConfirm(row),
                        },
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
                    isLoading={isLoading}
                />

                <ConfirmDialog
                    open={confirmDeleteOpen}
                    action="delete"
                    title="Eliminar categoría"
                    message={categoryToDelete ? `¿Deseas eliminar la categoría "${categoryToDelete.nombre}"? Esta acción no se puede deshacer.` : '¿Deseas eliminar esta categoría?'}
                    onCancel={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    loading={isLoading}
                />
            </PlaceholderPage>
        </>
    );
};
