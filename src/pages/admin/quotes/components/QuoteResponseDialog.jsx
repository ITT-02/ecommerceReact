import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';

import { AdminDialog } from '../../../../components/common/adminDialog/AdminDialog';
import { PersonalizationRequestSummary } from '../../../../components/quotes/PersonalizationRequestSummary';
import { formatCurrency }                from '../../../../utils/formatters';

// ── Helpers ────────────────────────────────────────────────────────────────────

const getExtraFromDetail  = (d = {}) => Number(d?.precio_adicional_referencial || 0);
const getBaseFromDetail   = (d = {}) => Number(d?.precio_base_referencial      || 0);
const getTotalFromDetail  = (d = {}) => Number(d?.precio_total_referencial     || 0);

const getSuggestedUnitPrice = (item = {}) => {
  const current = Number(item.precio_cotizado || 0);
  if (current > 0) return current;

  const detail = item.detalle_personalizacion || {};
  const total  = getTotalFromDetail(detail);
  if (total > 0) return total;

  return (Number(item.precio_referencial || 0) || getBaseFromDetail(detail)) + getExtraFromDetail(detail);
};

// ── Componente principal ───────────────────────────────────────────────────────

export const QuoteResponseDialog = ({ open, quote, loading = false, onClose, onSubmit }) => {
  const [items, setItems]       = useState([]);
  const [formData, setFormData] = useState({
    respuestaAdmin:    '',
    descuento:          0,
    costoEnvio:         0,
    vigenciaDias:       7,
    comentarioInterno: '',
  });

  useEffect(() => {
    if (!open || !quote) return;

    setItems(
      (quote.items || []).map((item) => ({
        id:                      item.id,
        nombre_producto:         item.nombre_producto,
        nombre_variante:         item.nombre_variante,
        codigoproducto:          item.codigoproducto,
        cantidad:                item.cantidad || 1,
        precio_cotizado:         getSuggestedUnitPrice(item) || '',
        comentario_admin:        item.comentario_admin || '',
        notas_cliente:           item.notas_cliente || '',
        detalle_personalizacion: item.detalle_personalizacion || {},
        personalizaciones:       item.personalizaciones || [],
        precio_referencial:      item.precio_referencial || 0,
      }))
    );

    setFormData({
      respuestaAdmin:    quote.respuesta_admin    || '',
      descuento:         quote.descuento_estimado  || 0,
      costoEnvio:        quote.costo_envio_estimado || 0,
      vigenciaDias:      7,
      comentarioInterno: quote.comentario_interno  || '',
    });
  }, [open, quote]);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + (Number(item.cantidad) || 0) * (Number(item.precio_cotizado) || 0), 0),
    [items]
  );

  const total = Math.max(
    subtotal - (Number(formData.descuento) || 0) + (Number(formData.costoEnvio) || 0),
    0
  );

  const handleItemChange   = (id, field, value) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

  const handleFormChange   = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      cotizacionId:      quote?.id,
      items:             items.map((item) => ({
        id:               item.id,
        cantidad:         Number(item.cantidad)        || 1,
        precio_cotizado:  Number(item.precio_cotizado) || 0,
        comentario_admin: item.comentario_admin        || null,
      })),
      respuestaAdmin:    formData.respuestaAdmin,
      descuento:         Number(formData.descuento)    || 0,
      costoEnvio:        Number(formData.costoEnvio)   || 0,
      vigenciaDias:      Number(formData.vigenciaDias) || 7,
      comentarioInterno: formData.comentarioInterno,
    });
  };

  const actions = (
    <>
      <Button onClick={onClose} disabled={loading} color="inherit">
        Cancelar
      </Button>
      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
      >
        {loading ? 'Guardando…' : 'Guardar'}
      </Button>
    </>
  );

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      title="Responder cotización"
      icon={<ReplyRoundedIcon />}
      maxWidth="md"
      loading={loading}
      actions={actions}
      onSubmit={handleSubmit}
    >
      <Stack spacing={2.5}>

        <Typography variant="subtitle2" color="text.secondary">
          {quote?.numero_cotizacion} · {quote?.nombre_cliente || 'Cliente'}
        </Typography>

        <Alert severity="info">
          <Typography variant="subtitle2" fontWeight={900}>Solicitud del cliente</Typography>
          <Typography variant="body2">
            {quote?.mensaje_cliente || 'Sin mensaje general del cliente.'}
          </Typography>
        </Alert>

        {quote?.requiere_personalizacion && (
          <PersonalizationRequestSummary
            title="Resumen de personalización"
            detail={quote?.detalle_personalizacion || {}}
          />
        )}

        <Divider />

        {/* Items */}
        {items.map((item) => {
          const hasPersonalization =
            item.detalle_personalizacion?.modo === 'personalizado' ||
            (item.personalizaciones || []).length > 0;
          const suggested = getSuggestedUnitPrice(item);

          return (
            <Box key={item.id}>
              <Stack spacing={1.25}>
                <Stack spacing={0.25}>
                  <Typography variant="subtitle2" fontWeight={900}>{item.nombre_producto}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.nombre_variante || item.codigoproducto || 'Variante'}
                  </Typography>
                </Stack>

                {item.notas_cliente && (
                  <Alert severity="info">Detalle del cliente: {item.notas_cliente}</Alert>
                )}

                {hasPersonalization ? (
                  <PersonalizationRequestSummary
                    title="Personalización solicitada"
                    detail={item.detalle_personalizacion || {}}
                    personalizations={item.personalizaciones || []}
                    compact
                  />
                ) : (
                  <Alert severity="success">Producto estándar.</Alert>
                )}

                {suggested > 0 && (
                  <Alert severity="warning">
                    Precio sugerido: <strong>{formatCurrency(suggested)}</strong>
                  </Alert>
                )}

                <Grid container spacing={1.5} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                      label="Cantidad"
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(item.id, 'cantidad', e.target.value)}
                      fullWidth required
                      slotProps={{ htmlInput: { min: 1 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                      label="Precio unitario"
                      type="number"
                      value={item.precio_cotizado}
                      onChange={(e) => handleItemChange(item.id, 'precio_cotizado', e.target.value)}
                      fullWidth required
                      slotProps={{ htmlInput: { min: 0.01, step: '0.01' } }}
                      helperText="Incluye personalización si corresponde."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Comentario para el cliente"
                      value={item.comentario_admin}
                      onChange={(e) => handleItemChange(item.id, 'comentario_admin', e.target.value)}
                      fullWidth
                      helperText="Visible para el cliente."
                    />
                  </Grid>
                </Grid>
              </Stack>

              <Divider sx={{ mt: 2 }} />
            </Box>
          );
        })}

        {/* Totales globales */}
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              name="descuento" label="Descuento" type="number"
              value={formData.descuento} onChange={handleFormChange}
              fullWidth slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              name="costoEnvio" label="Costo envío" type="number"
              value={formData.costoEnvio} onChange={handleFormChange}
              fullWidth slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              name="vigenciaDias" label="Vigencia días" type="number"
              value={formData.vigenciaDias} onChange={handleFormChange}
              fullWidth slotProps={{ htmlInput: { min: 1 } }}
            />
          </Grid>
        </Grid>

        <TextField
          name="respuestaAdmin" label="Respuesta para el cliente"
          value={formData.respuestaAdmin} onChange={handleFormChange}
          multiline minRows={3} fullWidth required
          helperText="Mensaje visible para el cliente."
        />

        <TextField
          name="comentarioInterno" label="Comentario interno"
          value={formData.comentarioInterno} onChange={handleFormChange}
          multiline minRows={2} fullWidth
        />

        <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
          <Typography variant="body2">Subtotal: <strong>{formatCurrency(subtotal)}</strong></Typography>
          <Typography variant="body2">Total: <strong>{formatCurrency(total)}</strong></Typography>
        </Stack>
      </Stack>
    </AdminDialog>
  );
};