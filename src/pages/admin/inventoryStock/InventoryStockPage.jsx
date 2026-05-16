// src/pages/admin/inventoryStock/InventoryStockPage.jsx

import React, { useState } from 'react';

import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
  Stack,
  Paper,
} from '@mui/material';

import {
  Search as SearchIcon,
  RefreshOutlined,
} from '@mui/icons-material';

// Componentes
import { DataTable } from '../../../components/common/dataTable/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';

// Hooks
import { useInventoryStockTable } from '../../../hooks/inventoryStock/useInventoryStockTable';
import { useInventoryStockAdjust } from '../../../hooks/inventoryStock/useInventoryStockAdjust';
import { useWarehouses } from '../../../hooks/inventoryStock/useWarehouses';

// Dialogs
import { InventoryDetailDialog } from './components/InventoryDetailDialog';
import { InventoryAdjustDialog } from './components/InventoryAdjustDialog';
import { MovementsDialog } from './components/MovementsDialog';

export const InventoryStockPage = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [movementsOpen, setMovementsOpen] = useState(false);

  const {
    rows,
    loading,
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
    refetch,
  } = useInventoryStockTable({
    initialPageNumber: 1,
    initialPageSize: 10,
  });

  const { adjust, loading: adjustLoading } =
    useInventoryStockAdjust();

  const { warehouses } = useWarehouses();

  // =========================
  // Handlers
  // =========================

  const handleViewDetail = (row) => {
    setSelectedItem(row);
    setDetailOpen(true);
  };

  const handleViewMovements = (row) => {
    setSelectedItem(row);
    setMovementsOpen(true);
  };

  const handleAdjustStock = (row) => {
    setSelectedItem(row);
    setAdjustOpen(true);
  };

  const handleAdjustConfirm = async (formData) => {
    try {
      await adjust({
        varianteId: selectedItem.variante_id,
        almacenId: selectedItem.almacen_id,
        nuevoStockFinal: formData.nuevoStockFinal,
        referenciaTipo: formData.referenciaTipo,
        notas: formData.notas,
      });

      setAdjustOpen(false);

      refetch();
    } catch (error) {
      console.error(
        'Error al ajustar:',
        error
      );

      throw error;
    }
  };

  // =========================
  // Estado stock
  // =========================

  const getStockState = (row) => {
    const cantidadDisponible = Number(
      row?.cantidad_disponible ?? 0
    );

    const stockMinimo = Number(
      row?.stock_minimo ?? 0
    );

    // Sin stock
    if (cantidadDisponible <= 0) {
      return 'SIN_STOCK';
    }

    // Stock bajo
    if (
      stockMinimo > 0 &&
      cantidadDisponible <= stockMinimo
    ) {
      return 'BAJO';
    }

    // Correcto
    return 'CORRECTO';
  };

  const getStockLabel = (state) => {
    switch (state) {
      case 'SIN_STOCK':
        return 'Sin stock';

      case 'BAJO':
        return 'Bajo';

      case 'CORRECTO':
      default:
        return 'Correcto';
    }
  };

  const getStockColor = (state) => {
    switch (state) {
      case 'SIN_STOCK':
      case 'BAJO':
        return 'error';

      case 'CORRECTO':
      default:
        return 'success';
    }
  };

  // =========================
  // Columnas
  // =========================

  const columns = [
    {
      key: 'producto_nombre',
      header: 'Producto',
    },

    {
      key: 'nombre_variante',
      header: 'Variante',
    },

    {
      key: 'atributos_resumen',
      header: 'Atributos',
      render: (row) =>
        row?.atributos_resumen || '-',
    },

    {
      key: 'almacen_nombre',
      header: 'Almacén',
    },

    {
      key: 'cantidad_disponible',
      header: 'Disponible',
      render: (row) =>
        row?.cantidad_disponible?.toLocaleString() ||
        '0',
    },

    {
      key: 'cantidad_reservada',
      header: 'Reservado',
      render: (row) =>
        row?.cantidad_reservada?.toLocaleString() ||
        '0',
    },

    {
      key: 'stock_total',
      header: 'Stock total',
      render: (row) =>
        row?.stock_total?.toLocaleString() ||
        '0',
    },

    {
      key: 'stock_minimo',
      header: 'Stock min.',
      render: (row) =>
        row?.stock_minimo?.toLocaleString() ||
        '-',
    },

    {
      key: 'stock_bajo',
      header: 'Estado',
      render: (row) => {
        const state =
          getStockState(row);

        return (
          <StatusChip
            label={getStockLabel(state)}
            color={getStockColor(state)}
          />
        );
      },
    },
  ];

  // =========================
  // Opciones filtros
  // =========================

  const stockBajoOptions = [
    {
      value: '',
      label: 'Todos',
    },
    {
      value: 'true',
      label: 'Stock bajo',
    },
    {
      value: 'false',
      label: 'Stock correcto',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            gutterBottom
          >
            Inventario
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Consulta y control de
            stock por variante y
            almacén
          </Typography>
        </Box>

        <Tooltip title="Actualizar">
          <IconButton
            onClick={() =>
              refetch()
            }
            disabled={loading}
          >
            <RefreshOutlined />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filtros */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={2}
        >
          <TextField
            placeholder="Buscar por producto, variante, código..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            size="small"
            sx={{ flex: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: 200,
            }}
          >
            <InputLabel>
              Almacén
            </InputLabel>

            <Select
              value={
                almacenId || ''
              }
              onChange={(e) =>
                setAlmacenId(
                  e.target.value ||
                    null
                )
              }
              label="Almacén"
            >
              <MenuItem value="">
                Todos
              </MenuItem>

              {warehouses?.map(
                (wh) => (
                  <MenuItem
                    key={wh.id}
                    value={wh.id}
                  >
                    {wh.nombre}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 150,
            }}
          >
            <InputLabel>
              Estado stock
            </InputLabel>

            <Select
              value={
                stockBajo ===
                null
                  ? ''
                  : String(
                      stockBajo
                    )
              }
              onChange={(e) => {
                const val =
                  e.target
                    .value;

                setStockBajo(
                  val === ''
                    ? null
                    : val ===
                        'true'
                );
              }}
              label="Estado stock"
            >
              {stockBajoOptions.map(
                (opt) => (
                  <MenuItem
                    key={
                      opt.value
                    }
                    value={
                      opt.value
                    }
                  >
                    {opt.label}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Tabla */}
      <DataTable
        columns={columns.map(
          (c) => ({
            field: c.key,
            headerName:
              c.header,
            renderCell:
              c.render,
          })
        )}
        rows={rows}
        loading={loading}
        pagination={pagination}
        onPageChange={
          setPageNumber
        }
        onPageSizeChange={
          setPageSize
        }
        actions={[
          {
            type: 'view',
            label:
              'Ver detalle',
            onClick:
              handleViewDetail,
          },
          {
            type: 'history',
            label:
              'Ver movimientos',
            onClick:
              handleViewMovements,
            disabled: (
              row
            ) =>
              !row?.variante_id ||
              !row?.almacen_id,
          },
          {
            type: 'edit',
            label:
              'Ajustar stock',
            onClick:
              handleAdjustStock,
          },
        ]}
      />

      {/* Dialog detalle */}
      <InventoryDetailDialog
        open={detailOpen}
        onClose={() =>
          setDetailOpen(false)
        }
        data={selectedItem}
        onViewMovements={() => {
          setDetailOpen(false);

          setMovementsOpen(
            true
          );
        }}
        onAdjustStock={() => {
          setDetailOpen(false);

          setAdjustOpen(
            true
          );
        }}
      />

      {/* Dialog ajuste */}
      <InventoryAdjustDialog
        open={adjustOpen}
        onClose={() =>
          setAdjustOpen(false)
        }
        data={selectedItem}
        onConfirm={
          handleAdjustConfirm
        }
        loading={adjustLoading}
      />

      {/* Dialog movimientos */}
      <MovementsDialog
        open={movementsOpen}
        onClose={() =>
          setMovementsOpen(
            false
          )
        }
        data={selectedItem}
      />
    </Box>
  );
};