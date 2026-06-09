import { useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import { AdminDialog } from '../../../components/common/adminDialog/AdminDialog';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { FileUploadField } from '../../../components/common/Field/FileUploadField';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import {
  useCommercialPartnerReport,
  useMyPartnerProductsForVariants,
  usePartnerProductRequests,
} from '../../../hooks/partners/useCommercialPartners';
import { formatCurrency } from '../../../utils/formatters';
import {
  emptyPagination,
  getDefaultAdminDateFilters,
  isDateRangeInvalid,
} from '../../../utils/defaultDateRange';

const initialProduct = {
  categoria_id: '',
  nombre: '',
  descripcion_corta: '',
  descripcion_larga: '',
  mostrar_precio: true,
  vender_sin_stock: false,
  requiere_cotizacion: false,
};

const initialVariant = {
  nombre_variante: '',
  medida_largo: '',
  medida_ancho: '',
  medida_alto: '',
  unidad_medida: 'cm',
  peso_gramos: '',
  precio: '',
  precio_comparacion: '',
  cantidad_disponible_socio: '',
  stock_minimo: 5,
};

const requestStatusLabel = {
  borrador: 'Borrador',
  pendiente_revision: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
};

const requestStatusColor = {
  borrador: 'default',
  pendiente_revision: 'warning',
  aprobado: 'success',
  rechazado: 'error',
};

const publicationStatusLabel = {
  en_revision: 'En revisión',
  no_publicado: 'No publicado',
  publicado: 'Publicado',
  retirado: 'Retirado de tienda',
  rechazado: 'No publicado',
};

const publicationStatusColor = {
  en_revision: 'warning',
  no_publicado: 'default',
  publicado: 'success',
  retirado: 'default',
  rechazado: 'error',
};

const getPublicationStatus = (request) => {
  if (request?.estado_publicacion) return request.estado_publicacion;
  if (request?.estado === 'pendiente_revision') return 'en_revision';
  if (request?.estado === 'rechazado') return 'rechazado';
  if (request?.estado === 'aprobado' && request?.producto_id) {
    return request?.producto_es_activo === false ? 'retirado' : 'publicado';
  }
  if (request?.estado === 'aprobado') return 'retirado';
  return 'no_publicado';
};

const getRequestAttributePairs = (request, attributes) => {
  const detailed = Array.isArray(request?.atributos_detalle) ? request.atributos_detalle : [];

  if (detailed.length) {
    return detailed
      .map((item) => ({
        atributo: item.atributo || item.atributo_nombre || item.nombre || '',
        valor: item.valor || item.valor_nombre || '',
      }))
      .filter((item) => item.atributo || item.valor);
  }

  const rawRows = Array.isArray(request?.atributos) ? request.atributos : [];

  return rawRows
    .map((row) => {
      const attribute = attributes.find((item) => item.id === row.atributo_id);
      const value = attribute?.valores?.find((item) => item.id === row.atributo_valor_id);

      if (!attribute && !value) return null;

      return {
        atributo: attribute?.nombre || 'Característica',
        valor: value?.valor || '-',
      };
    })
    .filter(Boolean);
};

const DetailItem = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={750} sx={{ wordBreak: 'break-word' }}>
      {value === '' || value == null ? '-' : value}
    </Typography>
  </Box>
);

const formatPercent = (value) => {
  if (value === '' || value == null || Number.isNaN(Number(value))) return '-';

  return `${Number(value).toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
};

const mapAttributesToPayload = (rows) =>
  rows
    .filter((row) => row.atributo_id && row.atributo_valor_id)
    .map((row) => ({
      atributo_id: row.atributo_id,
      atributo_valor_id: row.atributo_valor_id,
    }));

const getOptionId = (option) => option?.id || '';


const buildDimensionsLabel = (variant) => {
  const largo = Number(variant.medida_largo || 0);
  const ancho = Number(variant.medida_ancho || 0);
  const alto = Number(variant.medida_alto || 0);

  if (!largo && !ancho && !alto) return '';

  const unit = variant.unidad_medida || 'cm';
  return [largo || null, ancho || null, alto || null].filter(Boolean).join(' x ') + ` ${unit}`;
};

const getSelectedAttributePairs = (rows, attributes) =>
  rows
    .map((row) => {
      const attribute = attributes.find((item) => item.id === row.atributo_id);
      const value = attribute?.valores?.find((item) => item.id === row.atributo_valor_id);

      if (!attribute || !value) return null;

      return {
        atributo: attribute.nombre,
        valor: value.valor,
      };
    })
    .filter(Boolean);

const SectionCard = ({ title, description, children }) => (
  <Box
    sx={(theme) => ({
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: theme.palette.custom.radius.xs,
      bgcolor: 'background.paper',
      p: { xs: 2, md: 2.25 },
    })}
  >
    <Stack spacing={1.6}>
      <Box>
        <Typography variant="subtitle1" fontWeight={800}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      {children}
    </Stack>
  </Box>
);

const FlowStep = ({ number, title, description }) => (
  <Box
    sx={(theme) => ({
      height: '100%',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: theme.palette.custom.radius.xs,
      p: 1.5,
      bgcolor: 'background.default',
    })}
  >
    <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
      <Chip label={number} size="small" color="primary" variant="outlined" />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={800}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Box>
  </Box>
);

export const PartnerProductsPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [filters, setFilters] = useState(() => getDefaultAdminDateFilters());
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [requestType, setRequestType] = useState('producto_nuevo');
  const [existingProduct, setExistingProduct] = useState(null);
  const [product, setProduct] = useState(initialProduct);
  const [variant, setVariant] = useState(initialVariant);
  const [attributeRows, setAttributeRows] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');
  const [removeAttributeIndex, setRemoveAttributeIndex] = useState(null);
  const [detailRequest, setDetailRequest] = useState(null);
  const [reportDetail, setReportDetail] = useState(null);

  const { products: myPartnerProducts, loading: loadingMyProducts, error: myProductsError } = useMyPartnerProductsForVariants();

  const { report, loading: reportLoading, error: reportError } = useCommercialPartnerReport({
    fechaInicio: filters.fechaInicio || null,
    fechaFin: filters.fechaFin || null,
  });
  const invalidDateRange = isDateRangeInvalid({ values: filters });

  const {
    requests,
    categories,
    attributes,
    pagination,
    loading,
    fetching,
    saving,
    error,
    createRequest,
  } = usePartnerProductRequests({
    pageNumber,
    pageSize,
    estado: estado || null,
    scope: 'mine',
    search,
    fechaInicio: filters.fechaInicio || null,
    fechaFin: filters.fechaFin || null,
  });

  const selectedAttributes = useMemo(() => {
    return attributeRows.map((row) => row.atributo_id).filter(Boolean);
  }, [attributeRows]);

  const selectedAttributePairs = useMemo(() => {
    return getSelectedAttributePairs(attributeRows, attributes);
  }, [attributeRows, attributes]);

  const dimensionsLabel = useMemo(() => buildDimensionsLabel(variant), [variant]);

  const presentationPreview = useMemo(() => {
    const manualName = variant.nombre_variante?.trim();
    if (manualName) return manualName;

    const attributeText = selectedAttributePairs.map((item) => item.valor).join(' / ');
    return [attributeText, dimensionsLabel].filter(Boolean).join(' · ') || product.nombre.trim();
  }, [dimensionsLabel, product.nombre, selectedAttributePairs, variant.nombre_variante]);

  const resetForm = () => {
    setRequestType('producto_nuevo');
    setExistingProduct(null);
    setProduct(initialProduct);
    setVariant(initialVariant);
    setAttributeRows([]);
    setMediaFiles([]);
    setComment('');
    setFormError('');
    setFormOpen(false);
  };

  const handleProductChange = (field, value) => {
    setFormError('');
    setProduct((current) => ({ ...current, [field]: value }));
  };

  const handleVariantChange = (field, value) => {
    setFormError('');
    setVariant((current) => ({ ...current, [field]: value }));
  };

  const handleAttributeChange = (index, field, value) => {
    setAttributeRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
              ...(field === 'atributo_id' ? { atributo_valor_id: '' } : {}),
            }
          : row
      )
    );
  };

  const addAttributeRow = () => {
    setAttributeRows((current) => [...current, { atributo_id: '', atributo_valor_id: '' }]);
  };

  const requestRemoveAttributeRow = (index) => {
    setRemoveAttributeIndex(index);
  };

  const handleConfirmRemoveAttribute = () => {
    if (removeAttributeIndex === null) return;

    setAttributeRows((current) => current.filter((_, rowIndex) => rowIndex !== removeAttributeIndex));
    setRemoveAttributeIndex(null);
  };

  const validateForm = () => {
    if (requestType === 'nueva_presentacion' && !existingProduct?.id) {
      return 'Selecciona el producto aprobado al que deseas agregar una presentación.';
    }

    if (requestType === 'producto_nuevo' && !product.nombre.trim()) return 'Ingresa el nombre del producto.';
    if (requestType === 'producto_nuevo' && !product.categoria_id) return 'Selecciona una categoría habilitada.';
    if (!variant.precio || Number(variant.precio) <= 0) return 'Ingresa un precio sugerido válido.';
    if (variant.cantidad_disponible_socio !== '' && Number(variant.cantidad_disponible_socio) < 0) return 'La cantidad disponible no puede ser negativa.';
    if (!presentationPreview.trim()) {
      return 'Agrega un nombre de presentación, una medida o una característica para que Aliqora identifique qué se venderá.';
    }
    if (attributeRows.some((row) => row.atributo_id && !row.atributo_valor_id)) {
      return 'Completa los valores de características seleccionadas.';
    }
    return '';
  };

  const buildProductPayload = () => {
    if (requestType === 'nueva_presentacion') {
      return {
        nombre: existingProduct?.nombre || '',
        categoria_id: existingProduct?.categoria_id || '',
        descripcion_corta: '',
        descripcion_larga: '',
        mostrar_precio: true,
        vender_sin_stock: true,
        requiere_cotizacion: false,
      };
    }

    return product;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateForm();

    if (validation) {
      setFormError(validation);
      return;
    }

    const variantPayload = {
      ...variant,
      nombre_variante: variant.nombre_variante?.trim() || presentationPreview.trim(),
    };

    await createRequest({
      product: buildProductPayload(),
      variant: variantPayload,
      attributes: mapAttributesToPayload(attributeRows),
      mediaFiles,
      comment,
      sendForReview: true,
      existingProductId: requestType === 'nueva_presentacion' ? existingProduct?.id : null,
    });

    setNotice(requestType === 'nueva_presentacion' ? 'Presentación enviada a revisión. Aliqora la publicará solo cuando sea aprobada.' : 'Propuesta enviada a revisión. Aliqora publicará el producto solo cuando sea aprobado.');
    resetForm();
  };

  const columns = [
    {
      field: 'producto',
      headerName: 'Producto',
      width: 260,
      renderCell: (row) => row.producto?.nombre || '-',
    },
    {
      field: 'tipo_solicitud',
      headerName: 'Tipo',
      width: 165,
      renderCell: (row) => (row.tipo_solicitud === 'nueva_presentacion' ? 'Nueva presentación' : 'Producto nuevo'),
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 150,
      renderCell: (row) => (
        <Chip
          size="small"
          label={requestStatusLabel[row.estado] || row.estado}
          color={requestStatusColor[row.estado] || 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'producto_id',
      headerName: 'Publicado',
      width: 175,
      renderCell: (row) => {
        const status = getPublicationStatus(row);

        return (
          <Chip
            size="small"
            label={publicationStatusLabel[status] || status}
            color={publicationStatusColor[status] || 'default'}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'comentario_revision',
      headerName: 'Revision',
      width: 300,
      emptyText: 'Sin comentario',
    },
    {
      field: 'created_at',
      headerName: 'Fecha',
      width: 170,
      renderCell: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'),
    },
  ];

  const requestActions = [
    {
      type: 'view',
      label: 'Ver detalle enviado',
      icon: <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />,
      onClick: setDetailRequest,
    },
  ];

  const tableFilters = [
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      width: 190,
      options: [
        { label: 'Pendientes', value: 'pendiente_revision' },
        { label: 'Aprobados', value: 'aprobado' },
        { label: 'Rechazados', value: 'rechazado' },
      ],
    },
    {
      name: 'fechaInicio',
      label: 'Desde',
      type: 'date',
      width: 160,
      maxDate: filters.fechaFin || undefined,
    },
    {
      name: 'fechaFin',
      label: 'Hasta',
      type: 'date',
      width: 160,
      minDate: filters.fechaInicio || undefined,
    },
  ];

  const summary = report?.resumen || {};
  const reportRows = report?.productos || [];
  const filteredReportRows = useMemo(() => {
    const term = reportSearch.trim().toLowerCase();
    if (!term) return reportRows;

    return reportRows.filter((row) => {
      const presentationText = Array.isArray(row.presentaciones)
        ? row.presentaciones.map((item) => [item.nombre_variante, item.codigoproducto].filter(Boolean).join(' ')).join(' ')
        : '';

      const text = [
        row.nombre,
        row.estado_tienda,
        row.socio_nombre,
        presentationText,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return text.includes(term);
    });
  }, [reportRows, reportSearch]);
  const detailAttributes = getRequestAttributePairs(detailRequest, attributes);
  const detailMedia = Array.isArray(detailRequest?.multimedia) ? detailRequest.multimedia : [];
  const detailPublicationStatus = getPublicationStatus(detailRequest);
  const detailVariant = detailRequest?.variante || {};
  const detailProduct = detailRequest?.producto || {};
  const detailCommissionPercent = detailRequest?.socio_comision_porcentaje ?? detailProduct?.socio_comision_porcentaje;

  return (
    <PlaceholderPage
      title="Mis propuestas de producto"
      description="Envía productos y revisa tus ventas."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error || reportError || myProductsError || formError} />
        {invalidDateRange && <ErrorMessage message="La fecha inicial no puede ser mayor que la fecha final." />}

        {notice && (
          <Alert severity="success" onClose={() => setNotice('')}>
            {notice}
          </Alert>
        )}

        <Grid container spacing={2}>
          {[
            ['Publicados', summary.productos_publicados ?? summary.productos_aprobados ?? 0],
            ['Retirados', summary.productos_retirados ?? 0],
            ['Unidades pagadas', Number(summary.unidades_vendidas ?? 0)],
            ['Ventas', formatCurrency(summary.ventas_total ?? 0)],
            ['Comisión Aliqora', formatCurrency(summary.comision_aliqora_total ?? 0)],
            ['Liquidación', formatCurrency(summary.liquidacion_total ?? summary.comision_total ?? 0)],
          ].map(([label, value]) => (
            <Grid key={label} size={{ xs: 12, sm: 6, md: 2 }}>
              <Box sx={(theme) => ({ border: '1px solid', borderColor: 'divider', borderRadius: theme.palette.custom.radius.xs, p: 2 })}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="h5" fontWeight={800}>{value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <AdminResourceTable
          rows={invalidDateRange ? [] : requests}
          columns={columns}
          actions={requestActions}
          loading={loading || fetching}
          pagination={invalidDateRange ? emptyPagination({ pageNumber, pageSize }) : pagination}
          searchValue={search}
          searchLabel="Buscar"
          filterValues={{ estado, ...filters }}
          filters={tableFilters}
          onSearchChange={(value) => {
            setSearch(value);
            setPageNumber(1);
          }}
          onFilterChange={(name, value) => {
            if (name === 'estado') setEstado(value);
            else setFilters((current) => ({ ...current, [name]: value }));
            setPageNumber(1);
          }}
          onResetFilters={() => {
            setEstado('');
            setSearch('');
            setFilters(getDefaultAdminDateFilters());
            setPageNumber(1);
          }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPageNumber(1);
          }}
          primaryActionLabel="Enviar producto a revisión"
          onPrimaryAction={() => setFormOpen(true)}
          emptyTitle="No hay solicitudes"
          emptyDescription="Envía tu primera propuesta."
          maxHeight={420}
        />

        <Box>
          <Stack spacing={1.25} sx={{ mb: 1.25 }}>
            <Typography variant="h6" fontWeight={800}>
              Seguimiento de ventas
            </Typography>
            <Alert severity="info" sx={{ borderRadius: (theme) => theme.palette.custom.radius.xs }}>
              Ventas pagadas del rango seleccionado.
            </Alert>
          </Stack>
          <AdminResourceTable
            rows={filteredReportRows}
            columns={[
              { field: 'nombre', headerName: 'Producto', width: 280 },
              {
                field: 'es_activo',
                headerName: 'Estado tienda',
                width: 150,
                renderCell: (row) => (
                  <Chip
                    size="small"
                    label={row.es_activo === false ? 'Retirado' : 'Publicado'}
                    color={row.es_activo === false ? 'default' : 'success'}
                    variant="outlined"
                  />
                ),
              },
              { field: 'variantes', headerName: 'Presentaciones', width: 140 },
              { field: 'unidades_vendidas', headerName: 'Unidades pagadas', width: 145 },
              {
                field: 'socio_comision_porcentaje',
                headerName: 'Comisión vigente',
                width: 150,
                renderCell: (row) => formatPercent(row.socio_comision_porcentaje ?? row.comision_aliqora_porcentaje),
              },
              {
                field: 'ventas_total',
                headerName: 'Ventas cobradas',
                width: 150,
                renderCell: (row) => formatCurrency(row.ventas_total || 0),
              },
              {
                field: 'liquidacion_socio_total',
                headerName: 'Liquidación estimada',
                width: 170,
                renderCell: (row) => formatCurrency(row.liquidacion_socio_total ?? row.comision_total ?? row.utilidad_total ?? 0),
              },
              {
                field: 'comision_aliqora_total',
                headerName: 'Comisión Aliqora',
                width: 160,
                renderCell: (row) => formatCurrency(row.comision_aliqora_total || 0),
              },
            ]}
            actions={[
              {
                type: 'view',
                label: 'Ver presentaciones vendidas',
                icon: <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />,
                onClick: setReportDetail,
              },
            ]}
            loading={reportLoading}
            pagination={{ pageNumber: 1, pageSize: filteredReportRows.length || 10, totalPages: 1, totalCount: filteredReportRows.length }}
            searchValue={reportSearch}
            searchLabel="Buscar producto vendido"
            onSearchChange={setReportSearch}
            onResetFilters={() => setReportSearch('')}
            emptyTitle="Sin ventas"
            emptyDescription="Sin ventas pagadas en el periodo."
            maxHeight={320}
          />
        </Box>
      </Stack>

      <AdminDialog
        open={formOpen}
        onClose={resetForm}
        title="Enviar producto a revisión"
        icon={<Inventory2OutlinedIcon />}
        maxWidth="md"
        loading={saving}
        onSubmit={handleSubmit}
        actions={(
          <>
            <Button type="button" onClick={resetForm} disabled={saving}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              Enviar a revisión
            </Button>
          </>
        )}
      >
          <Stack spacing={2.5}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, md: 4 }}>
                <FlowStep number="1" title="Producto" description="Datos base." />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FlowStep number="2" title="Presentación" description="Precio y cantidad." />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FlowStep number="3" title="Revisión" description="Aprobación." />
              </Grid>
            </Grid>

            <SectionCard
              title="Tipo de propuesta"
              description="Producto nuevo o presentación adicional."
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                    select
                    label="Qué deseas enviar"
                    value={requestType}
                    onChange={(event) => {
                      setRequestType(event.target.value);
                      setExistingProduct(null);
                      setFormError('');
                    }}
                    fullWidth
                  >
                    <MenuItem value="producto_nuevo">Producto nuevo</MenuItem>
                    <MenuItem value="nueva_presentacion">Nueva presentación de un producto aprobado</MenuItem>
                  </TextField>
                </Grid>
                {requestType === 'nueva_presentacion' && (
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Autocomplete
                      options={myPartnerProducts}
                      value={existingProduct}
                      loading={loadingMyProducts}
                      onChange={(event, value) => {
                        setExistingProduct(value || null);
                        setFormError('');
                      }}
                      getOptionLabel={(option) => option?.nombre || ''}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderOption={(props, option) => {
                        const { key, ...optionProps } = props;

                        return (
                          <Box component="li" key={option.id || key} {...optionProps}>
                            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={750} noWrap>
                                {option.nombre}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {option.categoria_nombre || 'Sin categoría'} · {option.variantes || 0} presentación(es)
                              </Typography>
                            </Stack>
                          </Box>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Producto aprobado" placeholder="Escribe para buscar" required />
                      )}
                    />
                  </Grid>
                )}
              </Grid>
              {requestType === 'nueva_presentacion' && (
                <Alert severity="info" sx={{ mt: 1.5, borderRadius: (theme) => theme.palette.custom.radius.xs }}>
                  Solo se revisará la nueva presentación.
                </Alert>
              )}
            </SectionCard>

            {requestType === 'producto_nuevo' && (
            <SectionCard
              title="Datos del producto"
              description="Datos generales."
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <TextField
                    label="Nombre del producto"
                    value={product.nombre}
                    onChange={(event) => handleProductChange('nombre', event.target.value)}
                    placeholder="Ej. Caja de envío estándar"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Autocomplete
                    options={categories}
                    value={categories.find((category) => category.id === product.categoria_id) || null}
                    onChange={(event, value) => handleProductChange('categoria_id', value?.id || '')}
                    getOptionLabel={(option) => option?.nombre || ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField {...params} label="Categoría habilitada" placeholder="Escribe para buscar" required />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Descripción corta"
                    value={product.descripcion_corta}
                    onChange={(event) => handleProductChange('descripcion_corta', event.target.value)}
                    placeholder="Resumen breve."
                    fullWidth
                    multiline
                    minRows={2}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Detalle para revisión"
                    value={product.descripcion_larga}
                    onChange={(event) => handleProductChange('descripcion_larga', event.target.value)}
                    placeholder="Información relevante."
                    fullWidth
                    multiline
                    minRows={3}
                  />
                </Grid>
              </Grid>
            </SectionCard>
            )}

            <SectionCard
              title="Presentación de venta"
              description="Versión que se venderá."
            >

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Nombre de presentación"
                    value={variant.nombre_variante}
                    onChange={(event) => handleVariantChange('nombre_variante', event.target.value)}
                    placeholder="Ej. Kraft 20 x 15 x 10 cm"
                    helperText="Opcional si eliges características o medidas. Se usará para identificar esta versión."
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Precio sugerido"
                    type="number"
                    value={variant.precio}
                    onChange={(event) => handleVariantChange('precio', event.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Precio comparación"
                    type="number"
                    value={variant.precio_comparacion}
                    onChange={(event) => handleVariantChange('precio_comparacion', event.target.value)}
                    placeholder="Opcional"
                    helperText="Se muestra tachado si es mayor."
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Cantidad estimada disponible"
                    type="number"
                    value={variant.cantidad_disponible_socio}
                    onChange={(event) => handleVariantChange('cantidad_disponible_socio', event.target.value)}
                    helperText="Máximo disponible para vender."
                    fullWidth
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 2 }}>
                  <TextField label="Largo" type="number" value={variant.medida_largo} onChange={(event) => handleVariantChange('medida_largo', event.target.value)} fullWidth />
                </Grid>
                <Grid size={{ xs: 6, md: 2 }}>
                  <TextField label="Ancho" type="number" value={variant.medida_ancho} onChange={(event) => handleVariantChange('medida_ancho', event.target.value)} fullWidth />
                </Grid>
                <Grid size={{ xs: 6, md: 2 }}>
                  <TextField label="Alto" type="number" value={variant.medida_alto} onChange={(event) => handleVariantChange('medida_alto', event.target.value)} fullWidth />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <TextField label="Peso gramos" type="number" value={variant.peso_gramos} onChange={(event) => handleVariantChange('peso_gramos', event.target.value)} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, md: 9 }}>
                  <Box
                    sx={(theme) => ({
                      height: '100%',
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: theme.palette.custom.radius.xs,
                      px: 1.5,
                      py: 1.15,
                      bgcolor: 'background.default',
                    })}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Vista previa de presentación
                    </Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {presentationPreview || 'Se completará con el nombre, características o medidas.'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard
              title="Características habilitadas por Aliqora"
              description="Usa las opciones habilitadas."
            >
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1.5,
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Ejemplo: material, color, tamaño o acabado.
                  </Typography>
                  <Button startIcon={<AddIcon />} onClick={addAttributeRow}>
                    Agregar característica
                  </Button>
                </Box>
                {attributeRows.length === 0 && (
                  <Box
                    sx={(theme) => ({
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: theme.palette.custom.radius.xs,
                      p: 1.5,
                      color: 'text.secondary',
                    })}
                  >
                    <Typography variant="body2">
                      Sin características agregadas.
                    </Typography>
                  </Box>
                )}
                {attributeRows.map((row, index) => {
                  const attribute = attributes.find((item) => item.id === row.atributo_id);
                  const values = attribute?.valores || [];

                  return (
                    <Grid container spacing={1.5} key={`${row.atributo_id}-${index}`}>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <Autocomplete
                          options={attributes.filter((item) => !selectedAttributes.includes(item.id) || item.id === row.atributo_id)}
                          value={attributes.find((item) => item.id === row.atributo_id) || null}
                          onChange={(event, value) => handleAttributeChange(index, 'atributo_id', getOptionId(value))}
                          getOptionLabel={(option) => option?.nombre || ''}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          renderInput={(params) => (
                            <TextField {...params} label="Característica" placeholder="Escribe para buscar" />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <Autocomplete
                          options={values}
                          value={values.find((item) => item.id === row.atributo_valor_id) || null}
                          onChange={(event, value) => handleAttributeChange(index, 'atributo_valor_id', getOptionId(value))}
                          getOptionLabel={(option) => option?.valor || ''}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          disabled={!row.atributo_id}
                          renderInput={(params) => (
                            <TextField {...params} label="Valor permitido" placeholder="Escribe para buscar" />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <Button color="error" onClick={() => requestRemoveAttributeRow(index)} fullWidth sx={{ height: '100%' }}>
                          Quitar
                        </Button>
                      </Grid>
                    </Grid>
                  );
                })}
              </Stack>
            </SectionCard>

            <SectionCard
              title="Imágenes, video y comentario"
              description="Portada sugerida: primera imagen."
            >
            <FileUploadField
              label="Imágenes o video del producto"
              accept="image/*,video/*"
              value={mediaFiles}
              multiple
              maxFiles={6}
              height={132}
              helperText="La primera imagen será portada sugerida."
              onChange={setMediaFiles}
            />

            <TextField
              label="Comentario para revisión"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Observación opcional."
              fullWidth
              multiline
              minRows={2}
            />
            </SectionCard>
          </Stack>
      </AdminDialog>


      <AdminDialog
        open={Boolean(reportDetail)}
        onClose={() => setReportDetail(null)}
        title="Detalle de ventas del periodo"
        icon={<VisibilityOutlinedIcon />}
        maxWidth="md"
        actions={(
          <Button onClick={() => setReportDetail(null)} variant="contained">
            Cerrar
          </Button>
        )}
      >
        {reportDetail && (
          <Stack spacing={2}>

            <SectionCard title={reportDetail.nombre} description={reportDetail.es_activo === false ? 'Retirado de tienda.' : 'Publicado.'}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DetailItem label="Unidades pagadas" value={Number(reportDetail.unidades_vendidas || 0)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DetailItem label="Ventas cobradas" value={formatCurrency(reportDetail.ventas_total || 0)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DetailItem label="Comisión vigente" value={formatPercent(reportDetail.socio_comision_porcentaje ?? reportDetail.comision_aliqora_porcentaje)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DetailItem label="Comisión Aliqora" value={formatCurrency(reportDetail.comision_aliqora_total || 0)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DetailItem label="Liquidación estimada" value={formatCurrency(reportDetail.liquidacion_socio_total || 0)} />
                </Grid>
              </Grid>
            </SectionCard>
            <SectionCard title="Presentaciones" description="Detalle por presentación.">
              <Stack spacing={1}>
                {(Array.isArray(reportDetail.presentaciones) ? reportDetail.presentaciones : []).map((item) => (
                  <Box
                    key={item.variante_id || item.codigoproducto || item.nombre_variante}
                    sx={(theme) => ({
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: theme.palette.custom.radius.xs,
                      p: 1.5,
                    })}
                  >
                    <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="body2" fontWeight={800}>
                          {item.nombre_variante || 'Presentación'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.codigoproducto || 'Sin código'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 2 }}>
                        <DetailItem label="Vendidas" value={Number(item.unidades_vendidas || 0)} />
                      </Grid>
                      <Grid size={{ xs: 6, md: 2 }}>
                        <DetailItem label="Venta" value={formatCurrency(item.ventas_total || 0)} />
                      </Grid>
                      <Grid size={{ xs: 6, md: 2 }}>
                        <DetailItem label="Comisión" value={formatCurrency(item.comision_aliqora_total || 0)} />
                      </Grid>
                      <Grid size={{ xs: 6, md: 2 }}>
                        <DetailItem label="Liquidación" value={formatCurrency(item.liquidacion_socio_total || 0)} />
                      </Grid>
                      <Grid size={{ xs: 6, md: 2 }}>
                        <DetailItem label="Disponible" value={item.tipo_stock_operativo === 'stock_socio_limitado' ? `${Math.max(Number(item.stock_externo_disponible || 0) - Number(item.stock_externo_reservado || 0), 0)} disp.` : '-'} />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </SectionCard>
          </Stack>
        )}
      </AdminDialog>

      <AdminDialog
        open={Boolean(detailRequest)}
        onClose={() => setDetailRequest(null)}
        title="Detalle de propuesta enviada"
        icon={<VisibilityOutlinedIcon />}
        maxWidth="md"
        actions={(
          <Button onClick={() => setDetailRequest(null)} variant="contained">
            Cerrar
          </Button>
        )}
      >
        {detailRequest && (
          <Stack spacing={2.25}>
            <Box
              sx={(theme) => ({
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: theme.palette.custom.radius.xs,
                p: 2,
                bgcolor: 'background.default',
              })}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.5}
                sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={850}>
                    {detailProduct.nombre || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {detailVariant.nombre_variante || 'Presentación sin nombre específico'}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    label={requestStatusLabel[detailRequest.estado] || detailRequest.estado}
                    color={requestStatusColor[detailRequest.estado] || 'default'}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={publicationStatusLabel[detailPublicationStatus] || detailPublicationStatus}
                    color={publicationStatusColor[detailPublicationStatus] || 'default'}
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </Box>

            <SectionCard title="Producto enviado" description="Datos enviados.">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="Tipo de solicitud" value={detailRequest.tipo_solicitud === 'nueva_presentacion' ? 'Nueva presentación' : 'Producto nuevo'} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="Producto" value={detailProduct.nombre} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DetailItem label="Categoría" value={detailRequest.categoria_nombre || detailProduct.categoria_nombre} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <DetailItem label="Descripción corta" value={detailProduct.descripcion_corta} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <DetailItem label="Detalle para revisión" value={detailProduct.descripcion_larga} />
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard title="Presentación de venta" description="Versión enviada.">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <DetailItem label="Presentación" value={detailVariant.nombre_variante} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <DetailItem label="Precio sugerido" value={formatCurrency(detailVariant.precio || 0)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <DetailItem
                    label="Precio comparación"
                    value={detailVariant.precio_comparacion ? formatCurrency(detailVariant.precio_comparacion) : '-'}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <DetailItem label="Cantidad informada" value={detailVariant.cantidad_disponible_socio ?? '-'} />
                </Grid>
                {detailRequest.estado === 'aprobado' && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DetailItem label="Comisión Aliqora vigente" value={formatPercent(detailCommissionPercent)} />
                  </Grid>
                )}
                <Grid size={{ xs: 12, md: 4 }}>
                  <DetailItem
                    label="Medidas"
                    value={buildDimensionsLabel(detailVariant) || '-'}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <DetailItem label="Peso" value={detailVariant.peso_gramos ? `${detailVariant.peso_gramos} g` : '-'} />
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard title="Características seleccionadas" description="Atributos elegidos.">
              {detailAttributes.length ? (
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {detailAttributes.map((item, index) => (
                    <Chip
                      key={`${item.atributo}-${item.valor}-${index}`}
                      label={`${item.atributo}: ${item.valor}`}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sin características seleccionadas.
                </Typography>
              )}
            </SectionCard>

            <SectionCard title="Multimedia enviada" description="Archivos enviados.">
              {detailMedia.length ? (
                <Grid container spacing={1.5}>
                  {detailMedia.map((media, index) => (
                    <Grid key={`${media.url_archivo}-${index}`} size={{ xs: 6, sm: 4, md: 3 }}>
                      <Box
                        sx={(theme) => ({
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: theme.palette.custom.radius.xs,
                          overflow: 'hidden',
                          bgcolor: 'background.default',
                        })}
                      >
                        {media.tipo_multimedia === 'video' ? (
                          <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Video adjunto
                            </Typography>
                          </Box>
                        ) : (
                          <Box
                            component="img"
                            src={media.url_archivo}
                            alt={media.texto_alternativo || detailProduct.nombre || 'Producto'}
                            sx={{ width: '100%', height: 112, objectFit: 'cover', display: 'block' }}
                          />
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sin multimedia adjunta.
                </Typography>
              )}
            </SectionCard>

            <Divider />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailItem label="Comentario enviado" value={detailRequest.comentario_socio} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailItem label="Comentario de revisión" value={detailRequest.comentario_revision} />
              </Grid>
            </Grid>

            {detailPublicationStatus === 'retirado' && (
              <Alert severity="info" sx={{ borderRadius: (theme) => theme.palette.custom.radius.xs }}>
                Producto retirado de tienda. Se conserva historial.
              </Alert>
            )}
          </Stack>
        )}
      </AdminDialog>

      <ConfirmDialog
        open={removeAttributeIndex !== null}
        action="delete"
        title="Quitar característica"
        message="¿Quitar esta característica?"
        confirmText="Quitar"
        onCancel={() => setRemoveAttributeIndex(null)}
        onConfirm={handleConfirmRemoveAttribute}
      />
    </PlaceholderPage>
  );
};
