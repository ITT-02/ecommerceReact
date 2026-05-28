// Panel administrativo de cotizaciones.

import { useMemo, useState } from 'react';

import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import {
  Alert,
  Box,
  Chip,
  Stack,
  Typography,
} from '@mui/material';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PageHeader } from '../../../components/common/PageHeader';
import { useAdminQuotes } from '../../../hooks/sales/useAdminQuotes';
import { formatCurrency } from '../../../utils/formatters';
import { QuoteDetailDialog } from './components/QuoteDetailDialog';
import { QuoteResponseDialog } from './components/QuoteResponseDialog';
import { QuoteStatusDialog } from './components/QuoteStatusDialog';

const quoteStatusLabel = {
  solicitada: 'Solicitada',
  en_revision: 'En revisión',
  respondida: 'Respondida',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
  vencida: 'Vencida',
  convertida: 'Pedido generado',
};

const quoteStatusColor = {
  solicitada: 'info',
  en_revision: 'warning',
  respondida: 'success',
  aceptada: 'success',
  rechazada: 'error',
  cancelada: 'default',
  vencida: 'default',
  convertida: 'success',
};

const quoteTypeLabel = {
  cotizacion: 'Cotización',
  personalizacion: 'Personalización',
};

const orderStatusLabel = {
  pendiente: 'Pedido pendiente',
  confirmado: 'Pedido confirmado',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Pedido cancelado',
};

const paymentStatusLabel = {
  pendiente: 'Pago pendiente',
  validando: 'Pago en validación',
  pagado: 'Pago confirmado',
  rechazado: 'Pago rechazado',
  vencido: 'Pago vencido',
  reembolsado: 'Reembolsado',
};


export const QuotesPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ estado: '', fechaInicio: '', fechaFin: '' });

  const [selectedQuote, setSelectedQuote] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [responseOpen, setResponseOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const {
    quotes,
    pagination,
    loading,
    fetching,
    error,
    saving,
    getQuoteDetail,
    respondQuote,
    changeQuoteStatus,
  } = useAdminQuotes({
    pageNumber,
    pageSize,
    search,
    estado: filters.estado || null,
    fechaInicio: filters.fechaInicio || null,
    fechaFin: filters.fechaFin || null,
  });

  const openDetail = async (row) => {
    const detail = await getQuoteDetail(row.id);
    setSelectedQuote(detail);
    setDetailOpen(true);
  };

  const openResponse = async (row) => {
    const detail = await getQuoteDetail(row.id);
    setSelectedQuote(detail);
    setResponseOpen(true);
  };

  const openStatus = async (row) => {
    const detail = await getQuoteDetail(row.id);
    setSelectedQuote(detail);
    setStatusOpen(true);
  };

  const handleRespond = async (payload) => {
    await respondQuote(payload);
    setResponseOpen(false);
    setSelectedQuote(null);
    setNotice('Cotización respondida correctamente.');
  };

  const handleChangeStatus = async (payload) => {
    await changeQuoteStatus(payload);
    setStatusOpen(false);
    setSelectedQuote(null);
    setNotice('Estado de cotización actualizado.');
  };

  const tableFilters = [
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      width: 185,
      options: Object.entries(quoteStatusLabel).map(([value, label]) => ({ value, label })),
    },
    {
      name: 'fechaInicio',
      label: 'Desde',
      type: 'date',
      width: 155,
    },
    {
      name: 'fechaFin',
      label: 'Hasta',
      type: 'date',
      width: 155,
    },
  ];

  const columns = useMemo(
    () => [
      {
        field: 'numero_cotizacion',
        headerName: 'Cotización',
        width: 170,
        renderCell: (row) => (
          <Stack spacing={0.25}>
            <Typography variant="body2" fontWeight={900}>{row.numero_cotizacion}</Typography>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={quoteTypeLabel[row.tipo_solicitud] || 'Cotización'}
                color={row.tipo_solicitud === 'personalizacion' ? 'secondary' : 'default'}
                variant="outlined"
                sx={{ alignSelf: 'flex-start' }}
              />
              {row.canal_venta === 'manual' && (
                <Chip
                  size="small"
                  label="Venta manual"
                  color="info"
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start' }}
                />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'cliente',
        headerName: 'Cliente',
        width: 230,
        renderCell: (row) => (
          <Stack spacing={0.25}>
            <Typography variant="body2" fontWeight={800}>{row.nombre_cliente || '-'}</Typography>
            <Typography variant="caption" color="text.secondary">{row.telefono_cliente || row.correo_cliente || '-'}</Typography>
            {row.canal_venta === 'manual' && (
              <Typography variant="caption" color="text.secondary">
                Atención: {row.canal_atencion || 'manual'}
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        field: 'productos_resumen',
        headerName: 'Productos',
        width: 300,
        renderCell: (row) => (
          <Box>
            <Typography variant="body2" sx={{ whiteSpace: 'normal', lineHeight: 1.4 }}>
              {row.productos_resumen || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.total_items || 0} item(s)
            </Typography>
            {row.mensaje_cliente && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Solicitud: {row.mensaje_cliente}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        field: 'estado',
        headerName: 'Estado del proceso',
        width: 230,
        renderCell: (row) => (
          <Stack spacing={0.5}>
            <Chip
              size="small"
              label={quoteStatusLabel[row.estado] || row.estado}
              color={quoteStatusColor[row.estado] || 'default'}
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
            />

            {row.pedido_id ? (
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                  {row.numero_pedido ? `Pedido: ${row.numero_pedido}` : 'Pedido generado'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {orderStatusLabel[row.estado_pedido] || row.estado_pedido || 'Pedido pendiente'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {paymentStatusLabel[row.estado_pago] || row.estado_pago || 'Pago pendiente'}
                </Typography>
              </Stack>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Aún sin pedido
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        field: 'total_estimado',
        headerName: 'Total',
        width: 130,
        renderCell: (row) => (
          <Typography variant="body2" fontWeight={900}>
            {Number(row.total_estimado || 0) > 0 ? formatCurrency(row.total_estimado) : 'Pendiente'}
          </Typography>
        ),
      },
    ],
    []
  );

  const actions = [
    {
      type: 'view',
      label: 'Ver detalle',
      onClick: openDetail,
    },
    {
      type: 'edit',
      label: 'Responder cotización',
      icon: <ReplyOutlinedIcon sx={{ fontSize: 17 }} />,
      visible: (row) => ['solicitada', 'en_revision', 'respondida'].includes(row.estado),
      onClick: openResponse,
    },
    {
      type: 'history',
      label: 'Cambiar estado',
      icon: <SwapHorizOutlinedIcon sx={{ fontSize: 17 }} />,
      visible: (row) => !['convertida', 'aceptada'].includes(row.estado),
      onClick: openStatus,
    },
  ];

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Cotizaciones"
        description="Revisa solicitudes web y cotizaciones asistidas por vendedor."
        icon={<RequestQuoteOutlinedIcon />}
      />

      <ErrorMessage message={error} />

      {notice && (
        <Alert severity="success" onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}

      <AdminResourceTable
        rows={quotes}
        columns={columns}
        actions={actions}
        loading={loading || fetching}
        pagination={pagination}
        searchValue={search}
        searchLabel="Buscar cotización"
        filterValues={filters}
        filters={tableFilters}
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
          setFilters({ estado: '', fechaInicio: '', fechaFin: '' });
          setPageNumber(1);
        }}
        onPageChange={setPageNumber}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPageNumber(1);
        }}
        emptyTitle="No hay cotizaciones"
        emptyDescription="Cuando los clientes soliciten cotizaciones aparecerán aquí."
        maxHeight={620}
      />

      <QuoteDetailDialog
        open={detailOpen}
        quote={selectedQuote}
        onClose={() => setDetailOpen(false)}
      />

      <QuoteResponseDialog
        open={responseOpen}
        quote={selectedQuote}
        loading={saving}
        onClose={() => setResponseOpen(false)}
        onSubmit={handleRespond}
      />

      <QuoteStatusDialog
        open={statusOpen}
        quote={selectedQuote}
        loading={saving}
        onClose={() => setStatusOpen(false)}
        onSubmit={handleChangeStatus}
      />
    </Stack>
  );
};
