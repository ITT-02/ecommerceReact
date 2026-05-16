import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';


import { PageHeader } from '../../../components/common/PageHeader';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { StatusChip } from '../../../components/common/StatusChip';


import { useInventoryStockTable } from '../../../hooks/inventoryStock/useInventoryStockTable';
import { useInventoryStockMovements } from '../../../hooks/inventoryStock/useInventoryStockMovements';
import { useInventoryStockAdjust } from '../../../hooks/inventoryStock/useInventoryStockAdjust';


import { listarAlmacenesAutocomplete } from './helpers/listarAlmacenesAutocomplete';


const getDerivedStockState = (row) => {
  if (!row) return 'N/A';


  const cantidadDisponible = Number(row.cantidad_disponible ?? NaN);
  const stockTotal = Number(row.stock_total ?? NaN);
  const stockMinimo = Number(row.stock_minimo ?? NaN);


  if (!Number.isNaN(cantidadDisponible) && cantidadDisponible <= 0) {
    return 'SIN_STOCK';
  }


  if (row.stock_bajo === true) {
    return 'BAJO';
  }


  if (
    !Number.isNaN(stockTotal) &&
    !Number.isNaN(stockMinimo) &&
    stockTotal < stockMinimo
  ) {
    return 'BAJO';
  }


  if (!Number.isNaN(cantidadDisponible)) {
    return 'CORRECTO';
  }


  return 'N/A';
};


const formatStockStateLabel = (state) => {
  switch (state) {
    case 'SIN_STOCK':
      return 'Sin stock';


    case 'BAJO':
      return 'Bajo';


    case 'CORRECTO':
      return 'Correcto';


    case 'N/A':
    default:
      return 'N/A';
  }
};


const formatStockStateChipColor = (state) => {
  switch (state) {
    case 'SIN_STOCK':
    case 'BAJO':
      return 'error';


    case 'CORRECTO':
      return 'success';


    case 'N/A':
    default:
      return 'default';
  }
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
  } = useInventoryStockTable({
    initialPageNumber: 1,
    initialPageSize: 10,
  });


  const [detailOpen, setDetailOpen] = useState(false);
  const [movementsOpen, setMovementsOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);


  const [selectedRow, setSelectedRow] = useState(null);


  const [movementsQueryEnabled, setMovementsQueryEnabled] = useState(false);


  const [almacenes, setAlmacenes] = useState([]);


  const [nuevoStockFinal, setNuevoStockFinal] = useState('');
  const [notas, setNotas] = useState('');


  const {
    data: movementsData,
    loading: movementsLoading,
    error: movementsError,
  } = useInventoryStockMovements({
    varianteId: selectedRow?.variante_id,
    almacenId: selectedRow?.almacen_id,
    enabled: movementsQueryEnabled,
    pageNumber: 1,
    pageSize: 20,
  });


  const {
    adjust,
    loading: adjustLoading,
    error: adjustError,
  } = useInventoryStockAdjust();


  useEffect(() => {
    let isMounted = true;


    listarAlmacenesAutocomplete({ query: '' }).then((items) => {
      if (isMounted) {
        setAlmacenes(items || []);
      }
    });


    return () => {
      isMounted = false;
    };
  }, []);


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
        name: 'almacenId',
        label: 'Almacén',
        type: 'select',
        width: 240,
        options: almacenes.map((a) => ({
          label: a.nombre,
          value: String(a.id),
        })),
      },
      {
        name: 'estadoStock',
        label: 'Estado de stock',
        type: 'select',
        width: 220,
        options: [
          { label: 'Sin stock', value: 'SIN_STOCK' },
          { label: 'Bajo', value: 'BAJO' },
          { label: 'Correcto', value: 'CORRECTO' },
          { label: 'N/A', value: 'N/A' },
        ],
      },
    ],
    [almacenes]
  );


  const filterValues = useMemo(
    () => ({
      estadoStock: stockBajo || '',
      almacenId: almacenId ? String(almacenId) : '',
    }),
    [stockBajo, almacenId]
  );


  const handleFilterChange = (name, value) => {
    if (name === 'estadoStock') {
      setStockBajo(value || null);
    }


    if (name === 'almacenId') {
      setAlmacenId(value || null);
    }


    setPageNumber(1);
  };


  const handleResetFilters = () => {
    setSearch('');
    setAlmacenId(null);
    setStockBajo(null);
    setPageNumber(1);
  };


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
        <TextField
          select
          size="small"
          label="Almacén"
          value={almacenId ?? ''}
          onChange={(e) => {
            const value = e.target.value;


            setAlmacenId(value === '' ? null : value);
            setPageNumber(1);
          }}
          sx={{ width: { xs: '100%', sm: 320 } }}
        >
          <MenuItem value="">
            Todos
          </MenuItem>


          {almacenes.map((a) => (
            <MenuItem
              key={a.id}
              value={String(a.id)}
            >
              {a.nombre}
            </MenuItem>
          ))}
        </TextField>
      </Box>


      <AdminResourceTable
        rows={(rows || [])
          .map((r) => ({
            ...r,
            id: `${r.variante_id ?? ''}_${r.almacen_id ?? ''}`,
            estadoStockDerivado: getDerivedStockState(r),
          }))
          .filter((r) => {
            const cumpleEstado =
              stockBajo === null ||
              String(r.estadoStockDerivado) === String(stockBajo);


            const cumpleAlmacen =
              !almacenId ||
              String(r.almacen_id) === String(almacenId);


            return cumpleEstado && cumpleAlmacen;
          })}
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
        actions={[
          {
            type: 'info',
            label: 'Detalle',
            onClick: (row) => handleOpenDetail(row),
          },
          {
            type: 'history',
            label: 'Movimientos',
            onClick: (row) => handleOpenMovements(row),
          },
          {
            type: 'edit',
            label: 'Ajustar stock',
            onClick: (row) => handleOpenAdjust(row),
          },
        ]}
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
            field: 'estadoStockDerivado',
            headerName: 'Estado',
            width: 150,
            minWidth: 130,
            renderCell: (row) => {
              const derived = getDerivedStockState(row);


              return (
                <StatusChip
                  label={formatStockStateLabel(derived)}
                  color={formatStockStateChipColor(derived)}
                />
              );
            },
          },
        ]}
      />

      {/* MODAL DETALLE */}
      <Dialog
        open={detailOpen}
        onClose={handleCloseAll}
        maxWidth="md"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Detalle del inventario</DialogTitle>

        <DialogContent>
          {selectedRow && (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* BLOQUE 1 — PRODUCTO */}
              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Información del producto
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Producto
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedRow.producto_nombre || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Variante
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedRow.nombre_variante || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Atributos
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedRow.atributos_resumen || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* BLOQUE 2 — ALMACÉN Y STOCK */}
              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Información de stock en almacén
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Almacén
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedRow.almacen_nombre || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Disponible
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedRow.cantidad_disponible ?? 0}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Reservado
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedRow.cantidad_reservada ?? 0}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Stock total
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedRow.stock_total ?? 0}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Stock mínimo
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedRow.stock_minimo ?? 0}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* BLOQUE 3 — ESTADO DESTACADO */}
              <Box
                sx={{
                  p: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Estado actual del stock
                </Typography>

                <Box sx={{ pt: 1 }}>
                  <StatusChip
                    label={formatStockStateLabel(
                      getDerivedStockState(selectedRow)
                    )}
                    color={formatStockStateChipColor(
                      getDerivedStockState(selectedRow)
                    )}
                  />
                </Box>
              </Box>

            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseAll} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
          

      {/* MODAL MOVIMIENTOS */}
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
        <DialogTitle>
          Movimientos
        </DialogTitle>


        <DialogContent>
          <ErrorMessage message={movementsError} />


          <Box sx={{ py: 1 }}>
            {selectedRow && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Producto
                    </Typography>


                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedRow.producto_nombre || '-'}
                    </Typography>
                  </Grid>


                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Variante
                    </Typography>


                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedRow.nombre_variante || '-'}
                    </Typography>
                  </Grid>


                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Almacén
                    </Typography>


                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedRow.almacen_nombre || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}


            {movementsLoading ? (
              <Typography>
                Cargando...
              </Typography>
            ) : (movementsData?.items ?? []).length === 0 ? (
              <Typography>
                No hay movimientos registrados.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {(movementsData?.items ?? []).map((mov) => (
                  <Box
                    key={mov.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Fecha
                        </Typography>


                        <Typography>
                          {mov.created_at
                            ? new Date(mov.created_at).toLocaleString()
                            : '-'}
                        </Typography>
                      </Grid>


                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Tipo
                        </Typography>


                        <Typography>
                          {mov.tipo_movimiento || '-'}
                        </Typography>
                      </Grid>


                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Cantidad
                        </Typography>


                        <Typography>
                          {mov.cantidad ?? 0}
                        </Typography>
                      </Grid>


                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Referencia
                        </Typography>


                        <Typography>
                          {mov.referencia_tipo || '-'}
                        </Typography>
                      </Grid>


                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Anulado
                        </Typography>


                        <Typography>
                          {mov.anulado ? 'Sí' : 'No'}
                        </Typography>
                      </Grid>


                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Notas
                        </Typography>


                        <Typography>
                          {mov.notas || '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
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


      {/* MODAL AJUSTAR */}
      <Dialog
        open={adjustOpen}
        onClose={handleCloseAll}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>
          Ajustar stock
        </DialogTitle>


        <DialogContent>
          <ErrorMessage message={adjustError} />


          <Box
            sx={{
              pt: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              type="number"
              label="Nuevo stock final real"
              value={nuevoStockFinal}
              onChange={(e) =>
                setNuevoStockFinal(e.target.value)
              }
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
          <Button
            onClick={handleCloseAll}
            variant="outlined"
            disabled={adjustLoading}
          >
            Cancelar
          </Button>


          <Button
            variant="contained"
            disabled={adjustLoading}
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
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

