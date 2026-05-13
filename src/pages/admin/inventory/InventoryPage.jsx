// Página administrativa: Inventario.
import React, { useState, useMemo } from 'react';


// Componentes Propios
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';

// Hooks
import { useInventoryStockTable } from '../../../hooks/inventory/useInventory/useInventoryStockTable';
import { useInventoryStockAdjust } from '../../../hooks/inventory/useInventory/useInventoryStockAdjust';
import { useWarehouses } from '../../../hooks/inventory/useInventory/useWarehouses';

// Dialogs
import { InventoryDetailDialog } from './componentsInventory/InventoryDetailDialog';
import { InventoryAdjustDialog } from './componentsInventory/InventoryAdjustDialog';
import { MovementsDialog } from './componentsInventory/MovementsDialog';

export const InventoryPage = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [movementsOpen, setMovementsOpen] = useState(false);

  const {
    rows,
    loading,
    pagination,
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

  const { adjust, loading: adjustLoading } = useInventoryStockAdjust();
  const { warehouses } = useWarehouses();

  // =========================
  // Handlers
  // =========================

  const handleViewDetail = (row) => {
    document.activeElement?.blur();
    setSelectedItem(row);
    setDetailOpen(true);
  };

  const handleViewMovements = (row) => {
    document.activeElement?.blur();
    setSelectedItem(row);
    setMovementsOpen(true);
  };

  const handleAdjustStock = (row) => {
    document.activeElement?.blur();
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
      console.error('Error al ajustar:', error);
      throw error;
    }
  };

  // =========================
  // Lógica de Estado de Stock
  // =========================

  const getStockState = (row) => {
    const cantidadDisponible = Number(row?.cantidad_disponible ?? 0);
    const stockMinimo = Number(row?.stock_minimo ?? 0);

    if (cantidadDisponible <= 0) return 'SIN_STOCK';
    if (stockMinimo > 0 && cantidadDisponible <= stockMinimo) return 'BAJO';
    return 'CORRECTO';
  };

  // =========================
  // Configuración de Columnas
  // =========================

 const columns = [
     { field: 'producto_nombre', headerName: 'Producto', width: 220 },
     { field: 'nombre_variante', headerName: 'Variante', width: 240 },
     { field: 'atributos_resumen', headerName: 'Atributos', width: 280 },
     { field: 'almacen_nombre', headerName: 'Almacén', width: 180 },
     { field: 'cantidad_disponible', headerName: 'Disponible', width: 130 },
     { field: 'cantidad_reservada', headerName: 'Reservado', width: 130 },
     { field: 'stock_total', headerName: 'Stock total', width: 130 },
     { field: 'stock_minimo', headerName: 'Stock mín.', width: 130 },
    {
      field: 'stock_bajo',
      headerName: 'Estado',
      renderCell: (row) => {
        const state = getStockState(row);
        const config = {
          SIN_STOCK: { label: 'Sin stock', color: 'error' },
          BAJO: { label: 'Bajo', color: 'error' },
          CORRECTO: { label: 'Correcto', color: 'success' },
        };

        return (
          <StatusChip
            label={config[state].label}
            color={config[state].color}
          />
        );
      },
    },
  ];

  // =========================
  // Configuración de Filtros Declarativos
  // =========================

const filterValues = useMemo(() => ({
  almacenId: almacenId || '',
  stockBajo: stockBajo === null ? '' : String(stockBajo),
}), [almacenId, stockBajo]);

const filters = useMemo(() => [
  {
    name: 'almacenId',
    label: 'Almacén',
    type: 'select',
    width: 200,
    options: [
      ...(warehouses?.map((wh) => ({
        value: wh.id,
        label: wh.nombre,
      })) || []),
    ],
  },
  {
    name: 'stockBajo',
    label: 'Estado stock',
    type: 'select',
    width: 180,
    options: [
      { value: 'true', label: 'Stock bajo' },
      { value: 'false', label: 'Stock correcto' },
    ],
  },
], [warehouses]);

const handleFilterChange = (name, value) => {
  setPageNumber(1);

  if (name === 'almacenId') {
    setAlmacenId(value || null);
    return;
  }

  if (name === 'stockBajo') {
    setStockBajo(value === '' ? null : value === 'true');
  }
};

const handleResetFilters = () => {
  setSearch('');
  setAlmacenId(null);
  setStockBajo(null);
  setPageNumber(1);
};
  // =========================
  // Acciones por Fila
  // =========================

  const rowActions = useMemo(() => [
    {
      type: 'view',
      label: 'Ver detalle',
      onClick: handleViewDetail,
    },
    {
      type: 'history',
      label: 'Ver movimientos',
      onClick: handleViewMovements,
      disabled: (row) => !row?.variante_id || !row?.almacen_id,
    },
    {
      type: 'edit',
      label: 'Ajustar stock',
      onClick: handleAdjustStock,
    },
  ], []);

  return (
    <PlaceholderPage 
      title="Inventario" 
      description="Consulta y control de stock por variante y almacén"
    >
      <AdminResourceTable
        // Datos y Carga
        rows={rows}
        loading={loading}
        columns={columns}

        // Búsqueda Global
        searchPlaceholder="Buscar por producto, variante, código..."
        searchValue={search}
        onSearchChange={(value) => {
            setSearch(value);
            setPageNumber(1);
        }}

        // Filtros dinámicos
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}

        // Paginación vinculada al custom hook
        pagination={pagination}
        onPageChange={setPageNumber}
        onPageSizeChange={setPageSize}

        // Acciones de fila
        actions={rowActions}
        />

      {/* Dialogs de Control Operativo */}
      <InventoryDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        data={selectedItem}
        onViewMovements={() => {
          setDetailOpen(false);
          setMovementsOpen(true);
        }}
        onAdjustStock={() => {
          setDetailOpen(false);
          setAdjustOpen(true);
        }}
      />

      <InventoryAdjustDialog
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        data={selectedItem}
        onConfirm={handleAdjustConfirm}
        loading={adjustLoading}
      />

      <MovementsDialog
        open={movementsOpen}
        onClose={() => setMovementsOpen(false)}
        data={selectedItem}
      />
    </PlaceholderPage>
  );
};

import { InventoryStockPage } from '../inventoryStock/InventoryStockPage';

export const InventoryPage = () => <InventoryStockPage />;

