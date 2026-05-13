import React, { useMemo, useState } from 'react';
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { PageHeader } from '../../../components/common/PageHeader';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';

import { StatusChip } from '../../../components/common/StatusChip';

import { useInventoryStockTable } from '../../../hooks/inventoryStock/useInventoryStockTable';
import { useInventoryStockMovements } from '../../../hooks/inventoryStock/useInventoryStockMovements';
import { useInventoryStockAdjust } from '../../../hooks/inventoryStock/useInventoryStockAdjust';

import { listarAlmacenesAutocomplete } from './helpers/listarAlmacenesAutocomplete';

const formatBooleanStockBajo = (value) => {
  if (value === null || value === undefined) return '-';
  return value ? 'Bajo' : 'Correcto';
};

export const InventoryStockPage = () => {
  const theme = useTheme();

  const {
    rows,
    loading,
    error,
    pagination,

    pageNumber,
    pageSize,
    setPageNumber,
    setPageSize,

    search,
    setSearch,

    almacenId,
    setAlmacenId,

    stockBajo,
    setStockBajo,
  } = useInventoryStockTable({ initialPageNumber: 1, initialPageSize: 10 });

  const [detailOpen, setDetailOpen] = useState(false);
  const [movementsOpen, setMovementsOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);

  const [movementsQueryEnabled, setMovementsQueryEnabled] = useState(false);

  const { data: movementsData, loading: movementsLoading, error: movementsError } = (function () {
    // hook con params dinámicos: se montará con selectedRow cuando abra el modal
    const varianteId = selectedRow?.variante_id;
    const _almacenId = selectedRow?.almacen_id;

    return useInventoryStockMovements({
      varianteId,
      almacenId: _almacenId,
      enabled: movementsQueryEnabled,
      pageNumber: 1,
      pageSize: 20,
    });
  })();

  const {
    adjust,
    loading: adjustLoading,
    error: adjustError,
  } = useInventoryStockAdjust();

  const [nuevoStockFinal, setNuevoStockFinal] = useState('');
  const [notas, setNotas] = useState('');

  const resetAdjustForm = () => {
    setNuevoStockFinal('');
    setNotas('');
  };

  const handleOpenDetail = (row) => {
    setSelectedRow(row);
    setDetailOpen(true);
  };

  const handleOpenMovements = (row) => {
    setSelectedRow(row);
    setMovementsOpen(true);
    setMovementsQueryEnabled(true);
  };

  const handleOpenAdjust = (row) => {
    setSelectedRow(row);
    setAdjustOpen(true);
    resetAdjustForm();
  };

  const handleCloseAll = () => {
    setDetailOpen(false);
    setMovementsOpen(false);
    setAdjustOpen(false);
    setSelectedRow(null);
    setMovementsQueryEnabled(false);
    resetAdjustForm();
  };

  const tableFilters = useMemo(
    () => [
      {
        name: 'stockBajo',
        label: 'Estado de stock',
        type: 'select',
        width: 200,
        options: [
          { label: 'Stock bajo', value: 'true' },
          { label: 'Stock correcto', value: 'false' },
        ],
      },
    ],
    []
  );

  const filterValues = useMemo(() => {
    return {
      stockBajo: stockBajo === null ? '' : String(stockBajo),
    };
  }, [stockBajo]);

  const handleFilterChange = (name, value) => {
    if (name === 'stockBajo') {
      if (value === '') setStockBajo(null);
      else setStockBajo(value === 'true');
    }
    setPageNumber(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setAlmacenId(null);
    setStockBajo(null);
    setPageNumber(1);
  };

  // NOTA: el toolbar existente no soporta Autocomplete.
  // Se usa un TextField select para almacén si el proyecto no tiene Autocomplete reutilizable.
  // (La carga dinámica por backend se implementa como helper.)
  const [almacenes, setAlmacenes] = useState([]);

  React.useEffect(() => {
    let isMounted = true;
    listarAlmacenesAutocomplete({ query: '' }).then((items) => {
      if (isMounted) setAlmacenes(items);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
      }}
    >
      <PageHeader
        title="Inventario actual"
        description="Consulta stock por variante y almacén. Los cambios de stock se registran como movimientos."
      />

      <ErrorMessage message={error} />

      <Box sx={{ mb: 2 }}>
        {/* Filtro almacén (select) */}
        <TextField
          select
          size="small"
          label="Almacén"
          value={almacenId ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            setAlmacenId(v === '' ? null : v);
            setPageNumber(1);
          }}
          sx={{ width: { xs: '100%', sm: 320 } }}
        >
          <Box component="option" value="">Todos</Box>
          {almacenes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </TextField>
      </Box>

      <AdminResourceTable
        rows={rows.map((r) => ({
          ...r,
          id: `${r.variante_id ?? r.variante?.id ?? ''}_${r.almacen_id ?? r.almacen?.id ?? ''}`,
        }))}
        loading={Boolean(loading)}
        pagination={pagination}
        searchValue={search}
        searchLabel="Buscar"
        filterValues={filterValues}
        filters={tableFilters}
        onSearchChange={(value) => {
          setSearch(value);
          setPageNumber(1);
        }}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onPageChange={setPageNumber}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageNumber(1);
        }}
        emptyTitle="No hay inventario"
        emptyDescription="No hay datos para los filtros seleccionados."
        maxHeight={540}
        actions={[]}
        columns={[
          {
            field: 'producto_nombre',
            headerName: 'Producto',
            width: 240,
            minWidth: 200,
            renderCell: (row) => row.producto_nombre || '-',
          },
          {
            field: 'nombre_variante',
            headerName: 'Variante',
            width: 240,
            minWidth: 200,
            renderCell: (row) => row.nombre_variante || '-',
          },
          {
            field: 'atributos_resumen',
            headerName: 'Atributos',
            width: 280,
            minWidth: 220,
            renderCell: (row) => row.atributos_resumen || '-',
          },
          {
            field: 'almacen_nombre',
            headerName: 'Almacén',
            width: 220,
            minWidth: 180,
            renderCell: (row) => row.almacen_nombre || '-',
          },
          {
            field: 'cantidad_disponible',
            headerName: 'Disp.',
            width: 100,
            minWidth: 90,
            renderCell: (row) => row.cantidad_disponible ?? 0,
          },
          {
            field: 'cantidad_reservada',
            headerName: 'Res.',
            width: 100,
            minWidth: 90,
            renderCell: (row) => row.cantidad_reservada ?? 0,
          },
          {
            field: 'stock_total',
            headerName: 'Total',
            width: 110,
            minWidth: 90,
            renderCell: (row) => row.stock_total ?? 0,
          },
          {
            field: 'stock_minimo',
            headerName: 'Mín.',
            width: 110,
            minWidth: 90,
            renderCell: (row) => row.stock_minimo ?? 0,
          },
          {
            field: 'stock_bajo',
            headerName: 'Estado',
            width: 150,
            minWidth: 130,
            renderCell: (row) => (
              <StatusChip
                label={formatBooleanStockBajo(row.stock_bajo)}
                color={row.stock_bajo ? 'error' : 'success'}
              />
            ),
          },
          {
            field: 'acciones',
            headerName: 'Acciones',
            width: 300,
            minWidth: 260,
            renderCell: (row) => (
              <Grid container spacing={1}>
                <Grid item xs={12} sm={4}>
                  <Button size="small" variant="outlined" onClick={() => handleOpenDetail(row)}>
                    VER DETALLE
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button size="small" variant="outlined" onClick={() => handleOpenMovements(row)}>
                    VER MOVIMIENTOS
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button size="small" variant="contained" onClick={() => handleOpenAdjust(row)}>
                    AJUSTAR STOCK
                  </Button>
                </Grid>
              </Grid>
            ),
          },
        ]}
      />

      {/* Modal detalle */}
      <Dialog open={detailOpen} onClose={handleCloseAll} maxWidth="md" fullWidth disableRestoreFocus>
        <DialogTitle>Detalle del inventario</DialogTitle>
        <DialogContent>
          {selectedRow && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={1.5}>
                {[
                  ['Producto', selectedRow.producto_nombre],
                  ['Variante', selectedRow.nombre_variante],
                  ['Atributos', selectedRow.atributos_resumen],
                  ['Almacén', selectedRow.almacen_nombre],
                  ['Disp.', selectedRow.cantidad_disponible],
                  ['Reserv.', selectedRow.cantidad_reservada],
                  ['Stock total', selectedRow.stock_total],
                  ['Stock mínimo', selectedRow.stock_minimo],
                  ['Estado', formatBooleanStockBajo(selectedRow.stock_bajo)],
                ].map(([k, v]) => (
                  <Grid key={k} item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      {k}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{v ?? '-'}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAll} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal movimientos */}
      <Dialog
        open={movementsOpen}
        onClose={() => {
          setMovementsOpen(false);
          setMovementsQueryEnabled(false);
        }}
        maxWidth="md"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Movimientos</DialogTitle>
        <DialogContent>
          <ErrorMessage message={movementsError} />
          <Box sx={{ py: 1 }}>
            {movementsLoading ? (
              <Typography>Cargando...</Typography>
            ) : (
              <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
                {JSON.stringify(movementsData?.items ?? movementsData ?? [], null, 2)}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setMovementsOpen(false);
              setMovementsQueryEnabled(false);
            }}
            variant="outlined"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal ajustar */}
      <Dialog open={adjustOpen} onClose={handleCloseAll} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle>Ajustar stock</DialogTitle>
        <DialogContent>
          <ErrorMessage message={adjustError} />

          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              type="number"
              label="Nuevo stock final real"
              value={nuevoStockFinal}
              onChange={(e) => setNuevoStockFinal(e.target.value)}
              fullWidth
            />
            <TextField
              label="Notas (opcional)"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAll} variant="outlined" disabled={adjustLoading}>
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (!selectedRow) return;
              const cantidad = Number(nuevoStockFinal);
              await adjust({
                varianteId: selectedRow.variante_id,
                almacenId: selectedRow.almacen_id,
                tipoMovimiento: 'ajuste',
                cantidad,
                notas: notas || null,
                referenciaTipo: 'conteo_fisico',
                referenciaId: null,
              });
              handleCloseAll();
            }}
            variant="contained"
            disabled={adjustLoading}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

