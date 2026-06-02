// Página administrativa: Variantes agrupadas por producto.
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { VariantFormModal } from '../../../components/admin/variants/VariantFormModal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import {
  useGroupedVariants,
  useVariantActions,
} from '../../../hooks/catalog/useVariants';
import { getVariantById } from '../../../services/catalog/variantService';
import { formatCurrency } from '../../../utils/formatters';

const parseBooleanFilter = (value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

const getVariantId = (variant) => {
  return variant?.variante_id || variant?.id || null;
};

const getPriceRangeLabel = (min, max) => {
  if (min === null || min === undefined) return 'Sin precio';
  if (Number(min) === Number(max)) return formatCurrency(min);

  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
};

const getDefaultProductFromRow = (productRow) => {
  if (!productRow?.producto_id) return null;

  return {
    id: productRow.producto_id,
    nombre: productRow.producto_nombre,
    label: productRow.producto_nombre,
  };
};

const getDefaultProductFromVariant = (fullVariant, variantRow) => {
  const productId =
    fullVariant?.producto_id ||
    fullVariant?.productoId ||
    variantRow?.producto_id ||
    variantRow?.productoId ||
    null;

  const productName =
    fullVariant?.producto_nombre ||
    fullVariant?.productoNombre ||
    fullVariant?.productos?.nombre ||
    variantRow?.producto_nombre ||
    variantRow?.productoNombre ||
    '';

  if (!productId) return null;

  return {
    id: productId,
    nombre: productName || 'Producto seleccionado',
    label: productName || 'Producto seleccionado',
  };
};

const buildSimilarVariantDraft = (fullVariant, variantRow) => {
  return {
    ...fullVariant,
    id: null,
    variante_id: null,
    codigoproducto: '',
    codigoProducto: '',
    sku: '',
    created_at: null,
    updated_at: null,
    producto_id:
      fullVariant?.producto_id ||
      fullVariant?.productoId ||
      variantRow?.producto_id ||
      variantRow?.productoId ||
      null,
    producto_nombre:
      fullVariant?.producto_nombre ||
      fullVariant?.productoNombre ||
      fullVariant?.productos?.nombre ||
      variantRow?.producto_nombre ||
      variantRow?.productoNombre ||
      '',
    es_predeterminada: false,
    es_activa: true,
    __isSimilarDraft: true,
    __sourceVariantId: getVariantId(fullVariant) || getVariantId(variantRow),
  };
};

const renderAttributeChips = (summary) => {
  if (!summary || summary === 'Sin atributos') {
    return (
      <Typography variant="body2" color="text.secondary" fontStyle="italic">
        Sin atributos
      </Typography>
    );
  }

  const parts = summary.split(' · ');

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, py: 0.5 }}>
      {parts.map((part, index) => {
        const splitIdx = part.indexOf(': ');
        const attrName = splitIdx > -1 ? part.slice(0, splitIdx) : null;
        const attrValue = splitIdx > -1 ? part.slice(splitIdx + 2) : part;

        return (
          <Box
            key={`${part}-${index}`}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1,
              py: 0.3,
              borderRadius: 1.5,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {attrName && (
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}
              >
                {attrName}:
              </Typography>
            )}

            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {attrValue}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export const ProductVariantsPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ esActiva: '', tieneVariantes: '' });

  const [expandedProductIds, setExpandedProductIds] = useState(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantDraft, setVariantDraft] = useState(null);
  const [defaultProduct, setDefaultProduct] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const isActiveFilter = parseBooleanFilter(filters.esActiva);
  const hasVariantsFilter = parseBooleanFilter(filters.tieneVariantes);

  const {
    products,
    pagination,
    loading,
    error,
  } = useGroupedVariants({
    page,
    limit: pageSize,
    search: debouncedSearch,
    isActive: isActiveFilter,
    hasVariants: hasVariantsFilter,
  });

  const {
    saveVariant,
    removeVariant,
    deleting,
  } = useVariantActions();

  useEffect(() => {
    if (!debouncedSearch.trim()) return;

    setExpandedProductIds(
      new Set(
        products
          .filter((product) => Number(product.total_variantes ?? 0) > 0)
          .map((product) => product.producto_id)
      )
    );
  }, [debouncedSearch, products]);

  const handleToggleExpand = (product) => {
    if (Number(product.total_variantes ?? 0) <= 0) return;

    setExpandedProductIds((prev) => {
      const next = new Set(prev);

      if (next.has(product.producto_id)) {
        next.delete(product.producto_id);
      } else {
        next.add(product.producto_id);
      }

      return next;
    });
  };

  const displayRows = useMemo(() => {
    const rows = [];

    products.forEach((product) => {
      rows.push({
        id: `product-${product.producto_id}`,
        rowType: 'product',
        ...product,
      });

      if (expandedProductIds.has(product.producto_id)) {
        const variants = Array.isArray(product.variantes) ? product.variantes : [];

        variants.forEach((variant) => {
          rows.push({
            id: `variant-${variant.id}`,
            rowType: 'variant',
            parentId: product.producto_id,
            producto_id: product.producto_id,
            producto_nombre: product.producto_nombre,
            categoria_nombre: product.categoria_nombre,
            ...variant,
          });
        });
      }
    });

    return rows;
  }, [products, expandedProductIds]);

  const handleOpenModal = async (variantRow = null, productRow = null) => {
    document.activeElement?.blur();

    setVariantDraft(null);

    if (variantRow?.rowType === 'variant') {
      try {
        const fullVariant = await getVariantById(
          variantRow.variante_id || variantRow.id
        );

        setModalMode('edit');
        setSelectedVariant(fullVariant);
        setDefaultProduct(null);
      } catch (err) {
        console.error('Error al obtener la variante completa:', err);
        return;
      }
    } else {
      setModalMode('create');
      setSelectedVariant(null);
      setDefaultProduct(getDefaultProductFromRow(productRow));
    }

    setIsModalOpen(true);
  };

  const handleDuplicateVariant = async (variantRow) => {
    document.activeElement?.blur();

    try {
      const fullVariant = await getVariantById(
        variantRow.variante_id || variantRow.id
      );
      const draft = buildSimilarVariantDraft(fullVariant, variantRow);

      setModalMode('duplicate');
      setSelectedVariant(null);
      setVariantDraft(draft);
      setDefaultProduct(getDefaultProductFromVariant(fullVariant, variantRow));
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error al preparar la variante similar:', err);
      alert('No se pudo preparar la variante similar.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVariant(null);
    setVariantDraft(null);
    setDefaultProduct(null);
    setModalMode('create');
  };

  const handleSaveVariant = async (payload) => {
    try {
      const variantIdToUpdate =
        modalMode === 'edit'
          ? selectedVariant?.id || selectedVariant?.variante_id
          : null;

      await saveVariant(payload, variantIdToUpdate);
      handleCloseModal();
    } catch (err) {
      console.error('Error guardando variante:', err);
      alert('Hubo un error al guardar la variante.');
    }
  };

  const handleDeleteRequest = (row) => {
    setVariantToDelete(row);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!variantToDelete) return;

    try {
      await removeVariant(variantToDelete.variante_id || variantToDelete.id);
    } catch (err) {
      console.error('Error eliminando variante:', err);
      alert('Hubo un error eliminando la variante. Posiblemente existan entidades atadas a ella.');
    } finally {
      setDeleteDialogOpen(false);
      setVariantToDelete(null);
    }
  };

  const columns = [
    {
      field: 'producto_variante',
      headerName: 'Producto / Variante',
      width: 330,
      renderCell: (row) => {
        if (row.rowType === 'product') {
          const isExpanded = expandedProductIds.has(row.producto_id);
          const hasVariants = Number(row.total_variantes ?? 0) > 0;

          return (
            <Box
              role={hasVariants ? 'button' : undefined}
              tabIndex={hasVariants ? 0 : undefined}
              onClick={() => handleToggleExpand(row)}
              onKeyDown={(event) => {
                if (!hasVariants) return;

                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleToggleExpand(row);
                }
              }}
              sx={(theme) => ({
                width: '100%',
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1,
                py: 0.5,
                borderRadius: 1.5,
                cursor: hasVariants ? 'pointer' : 'default',
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                '&:hover': hasVariants
                  ? { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                  : undefined,
              })}
            >
              <IconButton
                size="small"
                disabled={!hasVariants}
                onMouseDown={(event) => event.preventDefault()}
                sx={(theme) => ({
                  width: 30,
                  height: 30,
                  borderRadius: 1,
                  color: hasVariants ? theme.palette.primary.main : theme.palette.text.disabled,
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  flexShrink: 0,
                })}
              >
                {isExpanded ? (
                  <KeyboardArrowUpIcon fontSize="small" />
                ) : (
                  <AccountTreeIcon fontSize="small" />
                )}
              </IconButton>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 900, lineHeight: 1.3 }}
                >
                  {row.producto_nombre}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block' }}
                >
                  {Number(row.total_variantes ?? 0)} variantes registradas
                </Typography>
              </Box>
            </Box>
          );
        }

        return (
          <Box sx={{ pl: 5, py: 0.5 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, lineHeight: 1.35 }}
            >
              └─ {row.nombre_variante || row.codigo_referencia || 'Variante estándar'}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Código interno: {row.codigoproducto || row.codigoProducto || 'Automático'}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'detalle',
      headerName: 'Categoría / Atributos',
      width: 330,
      renderCell: (row) => {
        if (row.rowType === 'product') {
          return (
            <Stack spacing={0.75} sx={{ py: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {row.categoria_nombre || 'Sin categoría'}
              </Typography>

              <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`${Number(row.variantes_activas ?? 0)} activas`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`${Number(row.variantes_inactivas ?? 0)} inactivas`}
                  color="default"
                  variant="outlined"
                />
              </Stack>
            </Stack>
          );
        }

        return renderAttributeChips(row.atributos_resumen);
      },
    },
    {
      field: 'medida',
      headerName: 'Medida',
      width: 160,
      renderCell: (row) => {
        if (row.rowType === 'product') {
          return (
            <Typography variant="body2" color="text.secondary">
              Según variante
            </Typography>
          );
        }

        return row.medida || row.etiqueta_medida || '-';
      },
    },
    {
      field: 'precio',
      headerName: 'Precio',
      width: 150,
      renderCell: (row) => {
        if (row.rowType === 'product') {
          return (
            <Typography variant="body2" sx={{ fontWeight: 900 }}>
              {getPriceRangeLabel(row.precio_minimo, row.precio_maximo)}
            </Typography>
          );
        }

        return (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {formatCurrency(row.precio)}
          </Typography>
        );
      },
    },
    {
      field: 'stock_minimo',
      headerName: 'Stock mín.',
      width: 120,
      renderCell: (row) => {
        if (row.rowType === 'product') {
          return row.stock_minimo_referencial ?? '-';
        }

        return row.stock_minimo ?? 0;
      },
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 130,
      renderCell: (row) => {
        const isActive = row.rowType === 'product' ? row.producto_activo : row.es_activa;

        return (
          <Chip
            size="small"
            label={isActive ? 'Activo' : 'Inactivo'}
            color={isActive ? 'success' : 'error'}
            variant="outlined"
          />
        );
      },
    },
  ];

  const actions = [
    {
      type: 'view',
      label: 'Ver / ocultar variantes',
      visible: (row) => row.rowType === 'product' && Number(row.total_variantes ?? 0) > 0,
      onClick: (row) => handleToggleExpand(row),
    },
    {
      type: 'add',
      label: 'Agregar variante a este producto',
      visible: (row) => row.rowType === 'product',
      onClick: (row) => handleOpenModal(null, row),
    },
    {
      type: 'edit',
      label: 'Editar variante',
      visible: (row) => row.rowType === 'variant',
      onClick: (row) => handleOpenModal(row),
    },
    {
      type: 'duplicate',
      label: 'Duplicar como similar',
      icon: <ContentCopyRoundedIcon sx={{ fontSize: 17 }} />,
      visible: (row) => row.rowType === 'variant',
      onClick: handleDuplicateVariant,
    },
    {
      type: 'delete',
      label: 'Eliminar variante',
      visible: (row) => row.rowType === 'variant',
      onClick: handleDeleteRequest,
    },
  ];

  const tableFilters = [
    {
      name: 'esActiva',
      label: 'Estado variante',
      type: 'select',
      width: 180,
      options: [
        { label: 'Activas', value: 'true' },
        { label: 'Inactivas', value: 'false' },
      ],
    },
    {
      name: 'tieneVariantes',
      label: 'Estructura',
      type: 'select',
      width: 185,
      options: [
        { label: 'Con variantes', value: 'true' },
        { label: 'Sin variantes', value: 'false' },
      ],
    },
  ];

  return (
    <PlaceholderPage
      title="Variantes de productos"
      description="Gestiona las opciones vendibles de cada producto agrupadas visualmente por producto principal."
    >
      <ErrorMessage message={error || null} />

      <AdminResourceTable
        rows={displayRows}
        columns={columns}
        actions={actions}
        loading={loading}
        pagination={pagination}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        searchValue={search}
        searchLabel="Buscar por producto, categoría, código, variante o atributo..."
        filters={tableFilters}
        filterValues={filters}
        onSearchChange={setSearch}
        onFilterChange={(name, value) => {
          setFilters((prev) => ({ ...prev, [name]: value }));
          setPage(1);
        }}
        onResetFilters={() => {
          setSearch('');
          setFilters({ esActiva: '', tieneVariantes: '' });
          setExpandedProductIds(new Set());
          setPage(1);
        }}
        primaryActionLabel="Nueva variante"
        onPrimaryAction={() => handleOpenModal()}
        emptyTitle="No se encontraron productos o variantes"
        emptyDescription="Intenta ajustar los filtros o registra una variante para un producto."
        maxHeight={640}
      />

      <VariantFormModal
        open={isModalOpen}
        variant={selectedVariant || variantDraft}
        defaultProduct={defaultProduct}
        mode={modalMode}
        onClose={handleCloseModal}
        onSave={handleSaveVariant}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        action="delete"
        title="¿Eliminar variante?"
        message={`¿Estás seguro de que deseas eliminar permanentemente la variante "${variantToDelete?.nombre_variante || variantToDelete?.codigo_referencia || 'seleccionada'}"? Esta acción no se puede deshacer.`}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        confirmText="Eliminar"
        loading={deleting}
      />
    </PlaceholderPage>
  );
};
