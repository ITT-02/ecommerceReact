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

import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { CategoryModal } from '../../../components/admin/categories/CategoryModal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { useCategories } from '../../../hooks/catalog/useCategories';
import { mapFormDataToCategory } from '../../../adapters/categoriesMapper';
import { useEffect, useMemo, useState } from 'react';

export const CategoriesPage = () => {
    const [searchValue, setSearchValue] = useState('');
    const [filterValues, setFilterValues] = useState({});
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [parentForSubcategory, setParentForSubcategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const [expandedIds, setExpandedIds] = useState(new Set());
    const [subcategoriesData, setSubcategoriesData] = useState({});

    const parseBooleanFilter = (value) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return null;
    };

    const {
        categories,
        pagination,
        loading,
        createCategory,
        updateCategory,
        deleteCategory,
        fetchSubcategories,
    } = useCategories({
        pageNumber,
        pageSize,
        search: searchValue,
        esActiva: parseBooleanFilter(filterValues.esActiva),
        esVisible: parseBooleanFilter(filterValues.esVisible),
    });

    const handleToggleExpand = async (category) => {
        const newExpandedIds = new Set(expandedIds);
        
        if (expandedIds.has(category.id)) {
            newExpandedIds.delete(category.id);
        } else {
            newExpandedIds.add(category.id);
            
            if (!subcategoriesData[category.id]) {
                const subs = await fetchSubcategories(category.id, false, searchValue);
                setSubcategoriesData(prev => ({ ...prev, [category.id]: subs }));
            }
        }
        setExpandedIds(newExpandedIds);
    };

    useEffect(() => {
        const loadMatchingSubcategories = async () => {
            if (!searchValue.trim() || categories.length === 0) return;

            const nextExpandedIds = new Set(expandedIds);

            for (const category of categories) {
                const subs = await fetchSubcategories(category.id, true, searchValue);

                if (subs.length > 0) {
                    nextExpandedIds.add(category.id);

                    setSubcategoriesData((prev) => ({
                        ...prev,
                        [category.id]: subs,
                    }));
                }
            }

            setExpandedIds(nextExpandedIds);
        };

        loadMatchingSubcategories();
    }, [searchValue, categories]);

    const displayRows = useMemo(() => {
        const rows = [];

        categories.forEach((category) => {
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
    }, [categories, expandedIds, subcategoriesData]);

    const handleOpenEdit = (category = null) => {
        setParentForSubcategory(null);
        setSelectedCategory(category);
        setOpen(true);
    };

    const handleOpenCreateSubcategory = (parentCategory) => {
        setSelectedCategory(null);
        setParentForSubcategory(parentCategory);
        setOpen(true);
    };

    const handleCloseEdit = () => {
        setOpen(false);
        setSelectedCategory(null);
        setParentForSubcategory(null);
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

            if (categoryData.categoria_padre_id) {
                const subs = await fetchSubcategories(categoryData.categoria_padre_id, true);
                setSubcategoriesData(prev => ({
                    ...prev,
                    [categoryData.categoria_padre_id]: subs,
                }));

                setExpandedIds(prev => {
                    const newExpandedIds = new Set(prev);
                    newExpandedIds.add(categoryData.categoria_padre_id);
                    return newExpandedIds;
                });
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

            if (category.categoria_padre_id) {
                const subs = await fetchSubcategories(category.categoria_padre_id, true);

                setSubcategoriesData(prev => ({
                    ...prev,
                    [category.categoria_padre_id]: subs,
                }));
            }

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
    const columns = [
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
            renderCell: (row) => {
                const isExpanded = expandedIds.has(row.id);
                const isParent = !row.isSubcategory;

                return (
                    <Box
                        role={isParent ? 'button' : undefined}
                        tabIndex={isParent ? 0 : undefined}
                        onClick={() => {
                            if (isParent) {
                                handleToggleExpand(row);
                            }
                        }}
                        onKeyDown={(event) => {
                            if (!isParent) return;

                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleToggleExpand(row);
                            }
                        }}
                        sx={(theme) => ({
                            width: '100%',
                            minHeight: 44,
                            px: 1,
                            py: 0.75,
                            pl: row.isSubcategory ? 4 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            borderRadius: 1,
                            cursor: isParent ? 'pointer' : 'default',
                            transition: theme.transitions.create(
                                ['background-color', 'color'],
                                { duration: theme.transitions.duration.shortest }
                            ),
                            '&:hover': isParent
                                ? {
                                    backgroundColor: theme.palette.action.hover,
                                }
                                : undefined,
                        })}
                    >
                        {/* ICONO SOLO PARA PADRES */}
                        {isParent && (
                            <IconButton
                                size="small"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleToggleExpand(row);
                                }}
                                sx={(theme) => ({
                                    width: 34,
                                    height: 34,
                                    color: 'primary.main',
                                    backgroundColor: theme.palette.action.selected,
                                    '&:hover': {
                                        backgroundColor: theme.palette.action.hover,
                                    },
                                })}
                            >
                                {isExpanded ? (
                                    <KeyboardArrowUpIcon fontSize="small" />
                                ) : (
                                    <AccountTreeIcon fontSize="small" />
                                )}
                            </IconButton>
                        )}

                        {/* SÍMBOLO SOLO PARA HIJOS */}
                        {row.isSubcategory && (
                            <Typography sx={{ color: 'primary.main', fontSize: '0.8rem', mr: 1 }}>
                                └─
                            </Typography>
                        )}

                        <Typography
                            sx={{
                                fontWeight: row.isSubcategory ? 400 : 700,
                                fontSize: '0.9rem',
                            }}
                        >
                            {row.nombre}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            field: 'descripcion',
            headerName: 'Descripción' },
        { field: 'slug', headerName: 'Slug'

        },
        {
            field: 'categoria_padre_nombre',
            headerName: 'Categoría padre',
            renderCell: (row) => row.categoria_padre_nombre || row.categoria_padre?.nombre || 'Principal',
        },
    ];

    const actions = [
        {
            type: 'add',
            label: 'Agregar subcategoría',
            visible: (row) => !row.isSubcategory && !row.categoria_padre_id,
            onClick: (row) => handleOpenCreateSubcategory(row),
        },
        {
            type: 'edit',
            label: 'Editar',
            onClick: (row) => handleOpenEdit(row),
        },
        {
            type: 'delete',
            label: 'Eliminar',
            onClick: (row) => handleOpenDeleteConfirm(row),
        },
    ];
  const  filters=[
        {
            name: 'esActiva',
            label: 'Estado',
            type: 'select',
            options: [
                { value: 'true', label: 'Activas' },
                { value: 'false', label: 'Inactivas' },
            ],
        },
        {
            name: 'esVisible',
            label: 'Visibilidad',
            type: 'select',
            options: [
                { value: 'true', label: 'Visibles' },
                { value: 'false', label: 'No visibles' },
            ],
        },
    ];
    return (
        <>
            <PlaceholderPage title="Categorías" description="Gestiona categorías principales." >
                <AdminResourceTable
                    rows={displayRows}
                    columns={columns}   
                    actions={actions}
                    loading={loading}
                    pagination={{
                        pageNumber: pagination.pageNumber,
                        pageSize: pagination.pageSize,
                        totalCount: pagination.totalCount,
                        totalPages: pagination.totalPages,
                    }}
                    searchValue={searchValue}
                    searchLabel="Buscar categorías..."
                    filterValues={filterValues}
                    filters={filters}
                    onSearchChange={(value) => {
                        setSearchValue(value);
                        setPageNumber(1);
                    }}
                    onFilterChange={(name, value) => {
                        setFilterValues((prev) => ({ ...prev, [name]: value }));
                        setPageNumber(1);
                    }}
                    onResetFilters={() => {
                        setSearchValue('');
                        setFilterValues({});
                        setPageNumber(1);
                    }}
                    onPageChange={setPageNumber}
                    onPageSizeChange={setPageSize}
                    primaryActionLabel="Crear categoría"
                    onPrimaryAction={() => handleOpenEdit()}
                    emptyTitle="No hay categorías"
                    emptyDescription="Crea tu primera categoría para organizar tus productos."
                />

                <CategoryModal
                    key={
                        open
                            ? selectedCategory?.id ?? parentForSubcategory?.id ?? 'new'
                            : 'closed'
                    }
                    open={open}
                    onClose={handleCloseEdit}
                    category={selectedCategory}
                    parentCategory={parentForSubcategory}
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