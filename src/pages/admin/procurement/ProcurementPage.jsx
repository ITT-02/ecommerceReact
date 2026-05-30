// Página administrativa: Compras / abastecimiento.
// Crea órdenes de compra y controla estados antes de la recepción de mercadería.

import { useState } from 'react';
import { Alert, Chip, Stack, Typography } from '@mui/material';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import {
  useProcurementOptions,
  usePurchaseOrdersAdmin,
} from '../../../hooks/procurement/useProcurement';
import { getPurchaseOrderDetail } from '../../../services/procurement/procurementService';
import { normalizeApiError } from '../../../utils/api/normalizeApiError';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { PurchaseOrderDetailDialog } from './components/PurchaseOrderDetailDialog';
import { PurchaseOrderDialog } from './components/PurchaseOrderDialog';
import { PurchaseOrderStatusDialog } from './components/PurchaseOrderStatusDialog';

const STATUS_OPTIONS = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'enviada', label: 'Enviada' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'parcial', label: 'Recibida parcial' },
  { value: 'recibida', label: 'Recibida' },
  { value: 'cancelada', label: 'Cancelada' },
];

const STATUS_COLOR = {
  borrador: 'default',
  enviada: 'warning',
  confirmada: 'info',
  parcial: 'secondary',
  recibida: 'success',
  cancelada: 'error',
};

const getStatusLabel = (value) => STATUS_OPTIONS.find((option) => option.value === value)?.label || value || '-';

export const ProcurementPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ estado: '' });
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [notice, setNotice] = useState('');

  const { proveedores, variantes } = useProcurementOptions('');

  const {
    rows,
    pagination,
    loading,
    fetching,
    saving,
    error,
    savePurchaseOrder,
    changeStatus,
  } = usePurchaseOrdersAdmin({
    pageNumber,
    pageSize,
    search,
    estado: filters.estado,
  });

  const loadOrderDetail = async (order) => {
    setDetailLoading(true);
    setLocalError('');

    try {
      const detail = await getPurchaseOrderDetail(order.id);
      setSelectedOrder(detail);
      return detail;
    } catch (err) {
      setLocalError(normalizeApiError(err) || 'No se pudo cargar el detalle de la orden.');
      return null;
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedOrder(null);
    setLocalError('');
    setOrderDialogOpen(true);
  };

  const handleEdit = async (row) => {
    const detail = await loadOrderDetail(row);
    if (detail) setOrderDialogOpen(true);
  };

  const handleView = async (row) => {
    setDetailDialogOpen(true);
    await loadOrderDetail(row);
  };

  const handleSaveOrder = async (payload) => {
    setLocalError('');

    try {
      await savePurchaseOrder(payload);
      setLocalError('');
      setNotice(payload.order?.id ? 'Orden de compra actualizada.' : 'Orden de compra registrada.');
      setOrderDialogOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      setLocalError(normalizeApiError(err) || 'No se pudo guardar la orden de compra.');
    }
  };

  const handleChangeStatus = async (payload) => {
    setLocalError('');

    try {
      await changeStatus(payload);
      setLocalError('');
      setNotice('Estado de compra actualizado.');
      setStatusDialogOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      setLocalError(normalizeApiError(err) || 'No se pudo cambiar el estado.');
    }
  };

  return (
    <PlaceholderPage
      title="Compras / abastecimiento"
      description="Genera órdenes de compra para reposición, bajo pedido o falta de stock. El inventario se actualiza únicamente desde recepción."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error || localError} />
        {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

        <AdminResourceTable
          rows={rows}
          columns={[
            {
              field: 'numero_orden',
              headerName: 'Orden',
              width: 155,
              renderCell: (row) => <Typography variant="caption" fontWeight={900}>{row.numero_orden}</Typography>,
            },
            { field: 'proveedor_nombre', headerName: 'Proveedor', width: 220, emptyText: '-' },
            { field: 'pedido_numero', headerName: 'Pedido origen', width: 150, emptyText: '-' },
            {
              field: 'estado',
              headerName: 'Estado',
              width: 155,
              renderCell: (row) => (
                <Chip
                  size="small"
                  label={getStatusLabel(row.estado)}
                  color={STATUS_COLOR[row.estado] || 'default'}
                  variant="outlined"
                />
              ),
            },
            { field: 'total_estimado', headerName: 'Total compra', width: 135, renderCell: (row) => formatCurrency(row.total_estimado) },
            {
              field: 'avance',
              headerName: 'Recibido',
              width: 130,
              renderCell: (row) => `${row.cantidad_recibida || 0} / ${row.cantidad_pedida || 0}`,
            },
            { field: 'fecha_estimada_recepcion', headerName: 'Recepción estimada', width: 170, renderCell: (row) => formatDate(row.fecha_estimada_recepcion) },
            { field: 'created_at', headerName: 'Fecha', width: 150, renderCell: (row) => formatDate(row.created_at) },
          ]}
          actions={[
            { type: 'view', label: 'Ver detalle', onClick: handleView },
            {
              type: 'edit',
              label: 'Editar',
              visible: (row) => ['borrador', 'enviada', 'confirmada'].includes(row.estado) && Number(row.cantidad_recibida || 0) === 0,
              onClick: handleEdit,
            },
            {
              type: 'status',
              label: 'Cambiar estado',
              icon: <FactCheckOutlinedIcon sx={{ fontSize: 17 }} />,
              visible: (row) => !['recibida', 'cancelada'].includes(row.estado),
              onClick: (row) => {
                setSelectedOrder(row);
                setLocalError('');
                setStatusDialogOpen(true);
              },
            },
          ]}
          loading={loading || fetching || saving || detailLoading}
          pagination={pagination}
          searchValue={search}
          searchLabel="Buscar orden"
          filters={[{ name: 'estado', label: 'Estado', type: 'select', width: 190, options: STATUS_OPTIONS }]}
          filterValues={filters}
          onSearchChange={(value) => {
            setSearch(value);
            setPageNumber(1);
          }}
          onFilterChange={(name, value) => {
            setFilters((current) => ({ ...current, [name]: value }));
            setPageNumber(1);
          }}
          onResetFilters={() => {
            setSearch('');
            setFilters({ estado: '' });
            setPageNumber(1);
          }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPageNumber(1);
          }}
          primaryActionLabel="Nueva compra"
          onPrimaryAction={handleCreate}
          emptyTitle="Sin órdenes de compra"
          emptyDescription="Crea compras para abastecer stock o atender productos bajo pedido."
          maxHeight={560}
        />
      </Stack>

      {orderDialogOpen && (
        <PurchaseOrderDialog
          key={selectedOrder?.id || 'nueva-compra'}
          open={orderDialogOpen}
          initialData={selectedOrder}
          suppliers={proveedores}
          variants={variantes}
          saving={saving}
          error={localError}
          onClose={() => {
            setOrderDialogOpen(false);
            setLocalError('');
          }}
          onSubmit={handleSaveOrder}
        />
      )}

      <PurchaseOrderDetailDialog
        open={detailDialogOpen}
        data={selectedOrder}
        loading={detailLoading}
        error={localError}
        onClose={() => {
          setDetailDialogOpen(false);
          setLocalError('');
        }}
      />

      {statusDialogOpen && (
        <PurchaseOrderStatusDialog
          key={selectedOrder?.id || 'estado-compra'}
          open={statusDialogOpen}
          order={selectedOrder}
          saving={saving}
          error={localError}
          onClose={() => {
            setStatusDialogOpen(false);
            setLocalError('');
          }}
          onSubmit={handleChangeStatus}
        />
      )}
    </PlaceholderPage>
  );
};
