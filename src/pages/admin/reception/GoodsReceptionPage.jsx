// Página administrativa: Recepción de mercadería.
// Registra ingresos reales desde compras/proveedores y actualiza inventario con costo promedio ponderado.

import { useState } from 'react';
import { Alert, Chip, Stack, TextField, Typography, Box, CircularProgress, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import {
  useGoodsReceptionsAdmin,
  usePendingPurchaseOrders,
  useProcurementOptions,
} from '../../../hooks/procurement/useProcurement';
import { getGoodsReceptionDetail } from '../../../services/procurement/procurementService';
import { normalizeApiError } from '../../../utils/api/normalizeApiError';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { CancelReceptionDialog } from './components/CancelReceptionDialog';
import { GoodsReceptionDetailDialog } from './components/GoodsReceptionDetailDialog';
import { GoodsReceptionDialog } from './components/GoodsReceptionDialog';
import { AdminDialog } from '../../../components/common/adminDialog/AdminDialog';

const STATUS_OPTIONS = [
  { value: 'parcial', label: 'Parcial' },
  { value: 'completa', label: 'Completa' },
  { value: 'anulada', label: 'Anulada' },
];

const STATUS_COLOR = {
  parcial: 'secondary',
  completa: 'success',
  anulada: 'error',
};

const getStatusLabel = (value) => STATUS_OPTIONS.find((option) => option.value === value)?.label || value || '-';

export const GoodsReceptionPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ estado: '' });
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReception, setSelectedReception] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [notice, setNotice] = useState('');

  const { proveedores, almacenes, variantes } = useProcurementOptions('');
  const { orders: pendingOrders } = usePendingPurchaseOrders('', formOpen);

  const {
    rows,
    pagination,
    loading,
    fetching,
    saving,
    error,
    registerReception,
    cancelReception,
  } = useGoodsReceptionsAdmin({
    pageNumber,
    pageSize,
    search,
    estado: filters.estado,
  });

  const handleRegisterReception = async (payload) => {
    setLocalError('');

    try {
      await registerReception(payload);
      setLocalError('');
      setNotice('Recepción registrada. Stock y costo promedio actualizados.');
      setFormOpen(false);
    } catch (err) {
      setLocalError(normalizeApiError(err) || 'No se pudo registrar la recepción.');
    }
  };

  const handleView = async (row) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setLocalError('');

    try {
      const detail = await getGoodsReceptionDetail(row.id);
      setSelectedReception(detail);
    } catch (err) {
      setLocalError(normalizeApiError(err) || 'No se pudo cargar el detalle de recepción.');
    } finally {
      setDetailLoading(false);
    }
  };


  const handleOpenCancel = (row) => {
    setLocalError('');
    setCancelError('');
    setCancelTarget(row);
  };

  const handleCancelReception = async ({ receptionId, motivoAnulacion }) => {
    setCancelError('');

    try {
      await cancelReception({ receptionId, motivoAnulacion });
      setCancelTarget(null);
      setNotice('Recepción anulada. Stock, orden de compra y costo promedio fueron actualizados.');
    } catch (err) {
      setCancelError(normalizeApiError(err) || 'No se pudo anular la recepción.');
      throw err;
    }
  };

  return (
    <PlaceholderPage
      title="Recepción de mercadería"
      description="Registra lo recibido físicamente, genera entrada de inventario y recalcula el costo promedio para utilidad y márgenes."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error || localError} />
        {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

        <AdminResourceTable
          rows={rows}
          columns={[
            {
              field: 'codigo_recepcion',
              headerName: 'Recepción',
              width: 165,
              renderCell: (row) => <Typography variant="caption" fontWeight={900}>{row.codigo_recepcion}</Typography>,
            },
            { field: 'numero_orden', headerName: 'Orden compra', width: 155, emptyText: 'Manual' },
            { field: 'proveedor_nombre', headerName: 'Proveedor', width: 220, emptyText: '-' },
            { field: 'almacen_nombre', headerName: 'Almacén', width: 170, emptyText: '-' },
            { field: 'documento_referencia', headerName: 'Documento', width: 165, emptyText: '-' },
            {
              field: 'estado',
              headerName: 'Estado',
              width: 145,
              renderCell: (row) => (
                <Chip
                  size="small"
                  label={getStatusLabel(row.estado)}
                  color={STATUS_COLOR[row.estado] || 'default'}
                  variant="outlined"
                />
              ),
            },
            { field: 'cantidad_recibida', headerName: 'Cantidad', width: 105 },
            { field: 'costo_total', headerName: 'Costo recibido', width: 140, renderCell: (row) => formatCurrency(row.costo_total) },
            { field: 'created_at', headerName: 'Fecha', width: 150, renderCell: (row) => formatDate(row.created_at) },
          ]}
          actions={[
            { type: 'view', label: 'Ver detalle', onClick: handleView },
            {
              type: 'cancel',
              label: 'Anular recepción',
              disabled: (row) => row.estado === 'anulada',
              onClick: handleOpenCancel,
            },
          ]}
          loading={loading || fetching || saving || detailLoading}
          pagination={pagination}
          searchValue={search}
          searchLabel="Buscar recepción"
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
          primaryActionLabel="Nueva recepción"
          onPrimaryAction={() => {
            setLocalError('');
            setFormOpen(true);
          }}
          emptyTitle="Sin recepciones"
          emptyDescription="Aquí aparecerán las entradas reales de mercadería desde proveedores."
          maxHeight={560}
        />
      </Stack>

      {formOpen && (
        <GoodsReceptionDialog
          key="nueva-recepcion"
          open={formOpen}
          pendingOrders={pendingOrders}
          suppliers={proveedores}
          warehouses={almacenes}
          variants={variantes}
          saving={saving}
          error={localError}
          onClose={() => {
            setFormOpen(false);
            setLocalError('');
          }}
          onSubmit={handleRegisterReception}
        />
      )}

      <CancelReceptionDialog
        open={Boolean(cancelTarget)}
        reception={cancelTarget}
        loading={saving}
        error={cancelError}
        onClose={() => {
          setCancelTarget(null);
          setCancelError('');
        }}
        onConfirm={handleCancelReception}
      />

      <AdminDialog
        open={detailOpen}
        title="Detalle de recepción"
        children={
          <>
            {detailLoading && (
              <Stack sx={{ py: 4, alignItems: 'center' }}>
                <CircularProgress size={28} />
              </Stack>
            )}

            {!detailLoading && <ErrorMessage message={localError} />}

            {!detailLoading && selectedReception && (
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">Recepción</Typography>
                      <Typography variant="h6" fontWeight={900}>{selectedReception.codigo_recepcion}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Orden</Typography>
                      <Typography variant="body2" fontWeight={800}>{selectedReception.numero_orden || 'Manual'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Proveedor</Typography>
                      <Typography variant="body2" fontWeight={800}>{selectedReception.proveedor_nombre || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Almacén</Typography>
                      <Typography variant="body2" fontWeight={800}>{selectedReception.almacen_nombre || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Estado</Typography>
                      <Box><Chip size="small" label={getStatusLabel(selectedReception.estado) || selectedReception.estado} variant="outlined" color={STATUS_COLOR[selectedReception.estado] || 'default'} /></Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Fecha</Typography>
                      <Typography variant="body2" fontWeight={800}>{formatDate(selectedReception.created_at)}</Typography>
                    </Box>
                  </Stack>
                </Paper>

                {(selectedReception.documento_referencia || selectedReception.observaciones) && (
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={900}>Documento / observaciones</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedReception.documento_referencia || 'Sin documento'} {selectedReception.observaciones ? `· ${selectedReception.observaciones}` : ''}
                    </Typography>
                  </Paper>
                )}

                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto / variante</TableCell>
                        <TableCell align="right">Cantidad</TableCell>
                        <TableCell align="right">Costo unit.</TableCell>
                        <TableCell align="right">Costo total</TableCell>
                        <TableCell>Observación</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(selectedReception.items || []).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={800}>{item.variante_label || item.producto_nombre}</Typography>
                            <Typography variant="caption" color="text.secondary">{item.codigoproducto || '-'}</Typography>
                          </TableCell>
                          <TableCell align="right">{item.cantidad_recibida}</TableCell>
                          <TableCell align="right">{formatCurrency(item.costo_unitario)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.costo_total)}</TableCell>
                          <TableCell>{item.observaciones || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Stack>
            )}
          </>
        }
        onClose={() => {
          setDetailOpen(false);
          setLocalError('');
        }}
        maxWidth="lg"
      >
        
      </AdminDialog>
    </PlaceholderPage>
  );
};
