// Página administrativa: seguimiento del vendedor.
// Centraliza cotizaciones asistidas respondidas y ventas manuales asignadas al vendedor.

import { useEffect, useMemo, useState } from 'react';

import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { FileUploadField } from '../../../components/common/Field/FileUploadField';
import { PageHeader } from '../../../components/common/PageHeader';
import { SelectFieldController } from '../../../components/forms/SelectFieldController';
import { TextFieldController } from '../../../components/forms/TextFieldController';
import {
  useSellerFollowUpActions,
  useSellerManualQuotes,
  useSellerManualSales,
} from '../../../hooks/sales/useSellerFollowUp';
import { formatCurrency } from '../../../utils/formatters';

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

const paymentStatusLabel = {
  pendiente: 'Pago pendiente',
  validando: 'Pago en validación',
  pagado: 'Pago confirmado',
  aprobado: 'Pago aprobado',
  rechazado: 'Pago rechazado',
  vencido: 'Pago vencido',
};

const orderStatusLabel = {
  pendiente_pago: 'Pendiente de pago',
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  preparando: 'Preparando',
  listo_para_envio: 'Listo para entrega/despacho',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const PAYMENT_METHOD_OPTIONS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'pos', label: 'POS / tarjeta' },
  { value: 'yape_plin', label: 'Yape / Plin' },
  { value: 'transferencia', label: 'Transferencia' },
];

const PAYMENT_STATE_OPTIONS = [
  { value: 'pagado', label: 'Pago confirmado' },
  { value: 'validando', label: 'Comprobante en validación' },
];

const initialPayment = {
  metodoPago: 'efectivo',
  estadoPago: 'pagado',
  referenciaTransaccion: '',
  comentario: '',
  comprobanteFile: null,
};

const getOptionValue = (option) => option.value;
const getOptionLabel = (option) => option.label;

const RegisterPaymentDialog = ({ open, quote, loading, onClose, onSubmit }) => {
  const [form, setForm] = useState(initialPayment);

  useEffect(() => {
    if (open) {
      setForm(initialPayment);
    }
  }, [open, quote?.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit?.({
      cotizacionId: quote?.id,
      metodoPago: form.metodoPago,
      estadoPago: form.estadoPago,
      referenciaTransaccion: form.referenciaTransaccion,
      comentario: form.comentario,
      comprobanteFile: form.comprobanteFile,
    });
  };

  const requiresProof = form.estadoPago === 'validando';
  const disabledSubmit = loading || (requiresProof && !form.comprobanteFile);

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Registrar pago de cotización
        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          aria-label="Cerrar"
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack component="form" id="seller-payment-form" spacing={2} onSubmit={handleSubmit}>
          <Alert severity="info">
            Registra el pago cuando el cliente ya confirmó la cotización con el vendedor.
          </Alert>

          {quote && (
            <Box>
              <Typography variant="subtitle1" fontWeight={900}>
                {quote.numero_cotizacion}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {quote.nombre_cliente || 'Cliente'} · Total {formatCurrency(quote.total_estimado)}
              </Typography>
            </Box>
          )}

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectFieldController
                required
                name="metodoPago"
                label="Método de pago"
                value={form.metodoPago}
                options={PAYMENT_METHOD_OPTIONS}
                emptyLabel={null}
                getValue={getOptionValue}
                getLabel={getOptionLabel}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectFieldController
                required
                name="estadoPago"
                label="Estado del pago"
                value={form.estadoPago}
                options={PAYMENT_STATE_OPTIONS}
                emptyLabel={null}
                getValue={getOptionValue}
                getLabel={getOptionLabel}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextFieldController
                name="referenciaTransaccion"
                label="Referencia de pago"
                value={form.referenciaTransaccion}
                onChange={handleChange}
              />
            </Grid>

            {requiresProof && (
              <Grid size={{ xs: 12 }}>
                <FileUploadField
                  label="Comprobante recibido"
                  accept="image/*,.pdf"
                  value={form.comprobanteFile}
                  height={150}
                  helperText="Adjunta el comprobante enviado por el cliente."
                  onChange={(file) => setForm((current) => ({ ...current, comprobanteFile: file }))}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <TextFieldController
                multiline
                minRows={2}
                name="comentario"
                label="Comentario interno"
                value={form.comentario}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="seller-payment-form"
          variant="contained"
          disabled={disabledSubmit}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          Registrar pago y generar pedido
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DetailDialog = ({ open, title, data, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle sx={{ pr: 6 }}>
      {title}
      <IconButton
        onClick={onClose}
        size="small"
        aria-label="Cerrar"
        sx={{ position: 'absolute', top: 8, right: 8 }}
      >
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </DialogTitle>

    <DialogContent dividers>
      {!data ? null : (
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" fontWeight={900}>
            {data.numero_cotizacion || data.numero_pedido}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Cliente: {data.nombre_cliente || '-'} · {data.telefono_cliente || data.correo_cliente || '-'}
          </Typography>

          {data.productos_resumen && (
            <Typography variant="body2">Productos: {data.productos_resumen}</Typography>
          )}

          {data.notas_internas && (
            <Alert severity="warning">
              <Typography variant="subtitle2" fontWeight={900}>Indicaciones internas para atención</Typography>
              <Typography variant="body2">{data.notas_internas}</Typography>
            </Alert>
          )}

          {data.comentario_interno && (
            <Alert severity="warning">
              <Typography variant="subtitle2" fontWeight={900}>Indicaciones internas de cotización</Typography>
              <Typography variant="body2">{data.comentario_interno}</Typography>
            </Alert>
          )}

          {data.datos_entrega && (
            <Alert severity="info">
              <Typography variant="subtitle2" fontWeight={900}>Entrega</Typography>
              <Typography variant="body2">
                {data.datos_entrega.tipo_entrega || 'Por coordinar'}
                {data.datos_entrega.direccion ? ` · ${data.datos_entrega.direccion}` : ''}
              </Typography>
              {(data.datos_entrega.distrito || data.datos_entrega.provincia || data.datos_entrega.departamento) && (
                <Typography variant="body2">
                  {[data.datos_entrega.distrito, data.datos_entrega.provincia, data.datos_entrega.departamento].filter(Boolean).join(' · ')}
                </Typography>
              )}
            </Alert>
          )}
        </Stack>
      )}
    </DialogContent>

    <DialogActions>
      <Button onClick={onClose}>Cerrar</Button>
    </DialogActions>
  </Dialog>
);

export const SellerFollowUpPage = () => {
  const [tab, setTab] = useState('quotes');
  const [quotePage, setQuotePage] = useState(1);
  const [salePage, setSalePage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [quoteSearch, setQuoteSearch] = useState('');
  const [saleSearch, setSaleSearch] = useState('');
  const [quoteFilters, setQuoteFilters] = useState({ estado: 'respondida' });
  const [saleFilters, setSaleFilters] = useState({ estadoPago: '' });
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  const quoteQuery = useSellerManualQuotes({
    pageNumber: quotePage,
    pageSize,
    search: quoteSearch,
    estado: quoteFilters.estado,
  });

  const saleQuery = useSellerManualSales({
    pageNumber: salePage,
    pageSize,
    search: saleSearch,
    estadoPago: saleFilters.estadoPago,
  });

  const { saving, error: actionError, markCommunicated, registerPayment } = useSellerFollowUpActions();

  const quoteColumns = useMemo(() => [
    {
      field: 'numero_cotizacion',
      headerName: 'Cotización',
      width: 165,
      renderCell: (row) => (
        <Stack spacing={0.25}>
          <Typography fontWeight={900}>{row.numero_cotizacion}</Typography>
          <Chip size="small" label={quoteStatusLabel[row.estado] || row.estado} variant="outlined" sx={{ alignSelf: 'flex-start' }} />
        </Stack>
      ),
    },
    {
      field: 'cliente',
      headerName: 'Cliente',
      width: 230,
      renderCell: (row) => (
        <Stack spacing={0.25}>
          <Typography fontWeight={800}>{row.nombre_cliente || '-'}</Typography>
          <Typography variant="caption" color="text.secondary">{row.telefono_cliente || row.correo_cliente || '-'}</Typography>
          <Typography variant="caption" color="text.secondary">Canal: {row.canal_atencion || 'manual'}</Typography>
        </Stack>
      ),
    },
    {
      field: 'productos_resumen',
      headerName: 'Productos',
      width: 300,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ whiteSpace: 'normal', lineHeight: 1.4 }}>
          {row.productos_resumen || '-'}
        </Typography>
      ),
    },
    {
      field: 'seguimiento',
      headerName: 'Seguimiento',
      width: 230,
      renderCell: (row) => (
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={800}>{formatCurrency(row.total_estimado)}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.comunicado_cliente_at ? 'Comunicada al cliente' : 'Pendiente de comunicar'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.pedido_id ? `Pedido: ${row.numero_pedido || 'generado'}` : 'Sin pedido generado'}
          </Typography>
        </Stack>
      ),
    },
  ], []);

  const saleColumns = useMemo(() => [
    {
      field: 'numero_pedido',
      headerName: 'Pedido',
      width: 170,
      renderCell: (row) => (
        <Stack spacing={0.25}>
          <Typography fontWeight={900}>{row.numero_pedido}</Typography>
          <Chip size="small" label="Venta manual" color="info" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
        </Stack>
      ),
    },
    {
      field: 'cliente',
      headerName: 'Cliente',
      width: 230,
      renderCell: (row) => (
        <Stack spacing={0.25}>
          <Typography fontWeight={800}>{row.nombre_cliente || 'Cliente mostrador'}</Typography>
          <Typography variant="caption" color="text.secondary">{row.telefono_cliente || row.correo_cliente || '-'}</Typography>
        </Stack>
      ),
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 230,
      renderCell: (row) => (
        <Stack spacing={0.25}>
          <Typography variant="body2">{orderStatusLabel[row.estado_pedido] || row.estado_pedido}</Typography>
          <Typography variant="caption" color="text.secondary">{paymentStatusLabel[row.estado_pago] || row.estado_pago}</Typography>
          {row.requiere_abastecimiento && <Chip size="small" color="warning" label="Requiere abastecimiento" sx={{ alignSelf: 'flex-start' }} />}
        </Stack>
      ),
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 130,
      renderCell: (row) => <Typography fontWeight={900}>{formatCurrency(row.total)}</Typography>,
    },
  ], []);

  const handleMarkCommunicated = async (row) => {
    await markCommunicated({ cotizacionId: row.id, comentario: 'Cotización comunicada al cliente por el vendedor.' });
    setNotice({ severity: 'success', message: 'Cotización marcada como comunicada.' });
  };

  const handleRegisterPayment = async (payload) => {
    const result = await registerPayment(payload);
    setPaymentOpen(false);
    setSelectedQuote(null);
    setNotice({ severity: 'success', message: `Pago registrado. Pedido: ${result?.numero_pedido || 'generado'}.` });
  };

  const quoteActions = [
    {
      type: 'view',
      label: 'Ver resumen',
      icon: <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />,
      onClick: (row) => {
        setSelectedDetail(row);
        setDetailOpen(true);
      },
    },
    {
      type: 'history',
      label: 'Marcar comunicada',
      icon: <CampaignOutlinedIcon sx={{ fontSize: 17 }} />,
      visible: (row) => row.estado === 'respondida' && !row.comunicado_cliente_at && !row.pedido_id,
      onClick: handleMarkCommunicated,
    },
    {
      type: 'edit',
      label: 'Registrar pago',
      icon: <AttachMoneyOutlinedIcon sx={{ fontSize: 17 }} />,
      visible: (row) => ['respondida', 'aceptada'].includes(row.estado) && !row.pedido_id,
      onClick: (row) => {
        setSelectedQuote(row);
        setPaymentOpen(true);
      },
    },
  ];

  const saleActions = [
    {
      type: 'view',
      label: 'Ver resumen',
      icon: <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />,
      onClick: (row) => {
        setSelectedDetail(row);
        setDetailOpen(true);
      },
    },
  ];

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Seguimiento vendedor"
        description="Gestiona cotizaciones asistidas y ventas manuales asignadas al vendedor."
      />

      <ErrorMessage message={quoteQuery.error || saleQuery.error || actionError} />
      {notice && <Alert severity={notice.severity} onClose={() => setNotice(null)}>{notice.message}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab value="quotes" icon={<PersonSearchOutlinedIcon fontSize="small" />} iconPosition="start" label="Cotizaciones respondidas" />
          <Tab value="sales" icon={<AttachMoneyOutlinedIcon fontSize="small" />} iconPosition="start" label="Ventas manuales" />
        </Tabs>
      </Box>

      {tab === 'quotes' && (
        <AdminResourceTable
          rows={quoteQuery.quotes}
          columns={quoteColumns}
          actions={quoteActions}
          loading={quoteQuery.loading || quoteQuery.fetching || saving}
          pagination={quoteQuery.pagination}
          searchValue={quoteSearch}
          searchLabel="Buscar cotización"
          filterValues={quoteFilters}
          filters={[{
            name: 'estado',
            label: 'Estado',
            type: 'select',
            width: 190,
            options: [
              { value: '', label: 'Todas' },
              { value: 'respondida', label: 'Respondidas' },
              { value: 'aceptada', label: 'Aceptadas' },
              { value: 'convertida', label: 'Con pedido generado' },
              { value: 'vencida', label: 'Vencidas' },
              { value: 'cancelada', label: 'Canceladas' },
            ],
          }]}
          onSearchChange={(value) => {
            setQuoteSearch(value);
            setQuotePage(1);
          }}
          onFilterChange={(name, value) => {
            setQuoteFilters((current) => ({ ...current, [name]: value }));
            setQuotePage(1);
          }}
          onResetFilters={() => {
            setQuoteSearch('');
            setQuoteFilters({ estado: 'respondida' });
            setQuotePage(1);
          }}
          onPageChange={setQuotePage}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setQuotePage(1);
          }}
          emptyTitle="Sin cotizaciones asignadas"
          emptyDescription="Cuando existan cotizaciones asistidas respondidas aparecerán aquí."
          maxHeight={620}
        />
      )}

      {tab === 'sales' && (
        <AdminResourceTable
          rows={saleQuery.sales}
          columns={saleColumns}
          actions={saleActions}
          loading={saleQuery.loading || saleQuery.fetching}
          pagination={saleQuery.pagination}
          searchValue={saleSearch}
          searchLabel="Buscar venta manual"
          filterValues={saleFilters}
          filters={[{
            name: 'estadoPago',
            label: 'Pago',
            type: 'select',
            width: 190,
            options: [
              { value: '', label: 'Todos' },
              { value: 'pendiente', label: 'Pendiente' },
              { value: 'validando', label: 'En validación' },
              { value: 'pagado', label: 'Confirmado' },
              { value: 'rechazado', label: 'Rechazado' },
            ],
          }]}
          onSearchChange={(value) => {
            setSaleSearch(value);
            setSalePage(1);
          }}
          onFilterChange={(name, value) => {
            setSaleFilters((current) => ({ ...current, [name]: value }));
            setSalePage(1);
          }}
          onResetFilters={() => {
            setSaleSearch('');
            setSaleFilters({ estadoPago: '' });
            setSalePage(1);
          }}
          onPageChange={setSalePage}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setSalePage(1);
          }}
          emptyTitle="Sin ventas manuales"
          emptyDescription="Las ventas manuales registradas por el vendedor aparecerán aquí."
          maxHeight={620}
        />
      )}

      <RegisterPaymentDialog
        open={paymentOpen}
        quote={selectedQuote}
        loading={saving}
        onClose={() => setPaymentOpen(false)}
        onSubmit={handleRegisterPayment}
      />

      <DetailDialog
        open={detailOpen}
        title="Resumen de seguimiento"
        data={selectedDetail}
        onClose={() => setDetailOpen(false)}
      />
    </Stack>
  );
};
