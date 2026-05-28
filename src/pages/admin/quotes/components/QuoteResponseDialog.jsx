import { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { PersonalizationRequestSummary } from '../../../../components/quotes/PersonalizationRequestSummary';
import { formatCurrency } from '../../../../utils/formatters';

const getExtraFromDetail = (detail = {}) => Number(detail?.precio_adicional_referencial || 0);
const getBaseFromDetail = (detail = {}) => Number(detail?.precio_base_referencial || 0);
const getTotalFromDetail = (detail = {}) => Number(detail?.precio_total_referencial || 0);

const getSuggestedUnitPrice = (item = {}) => {
  const currentQuoted = Number(item.precio_cotizado || 0);
  if (currentQuoted > 0) return currentQuoted;

  const detail = item.detalle_personalizacion || {};
  const totalFromDetail = getTotalFromDetail(detail);
  if (totalFromDetail > 0) return totalFromDetail;

  const base = Number(item.precio_referencial || 0) || getBaseFromDetail(detail);
  const extra = getExtraFromDetail(detail);

  return base + extra;
};

export const QuoteResponseDialog = ({ open, quote, loading = false, onClose, onSubmit }) => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    respuestaAdmin: '',
    descuento: 0,
    costoEnvio: 0,
    vigenciaDias: 7,
    comentarioInterno: '',
  });

  useEffect(() => {
    if (!open || !quote) return;

    setItems(
      (quote.items || []).map((item) => ({
        id: item.id,
        nombre_producto: item.nombre_producto,
        nombre_variante: item.nombre_variante,
        codigoproducto: item.codigoproducto,
        cantidad: item.cantidad || 1,
        precio_cotizado: getSuggestedUnitPrice(item) || '',
        comentario_admin: item.comentario_admin || '',
        notas_cliente: item.notas_cliente || '',
        detalle_personalizacion: item.detalle_personalizacion || {},
        personalizaciones: item.personalizaciones || [],
        precio_referencial: item.precio_referencial || 0,
      }))
    );

    setFormData({
      respuestaAdmin: quote.respuesta_admin || '',
      descuento: quote.descuento_estimado || 0,
      costoEnvio: quote.costo_envio_estimado || 0,
      vigenciaDias: 7,
      comentarioInterno: quote.comentario_interno || '',
    });
  }, [open, quote]);

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const cantidad = Number(item.cantidad) || 0;
      const precio = Number(item.precio_cotizado) || 0;
      return total + cantidad * precio;
    }, 0);
  }, [items]);

  const total = Math.max(
    subtotal - (Number(formData.descuento) || 0) + (Number(formData.costoEnvio) || 0),
    0
  );

  const handleItemChange = (id, field, value) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit?.({
      cotizacionId: quote?.id,
      items: items.map((item) => ({
        id: item.id,
        cantidad: Number(item.cantidad) || 1,
        precio_cotizado: Number(item.precio_cotizado) || 0,
        comentario_admin: item.comentario_admin || null,
      })),
      respuestaAdmin: formData.respuestaAdmin,
      descuento: Number(formData.descuento) || 0,
      costoEnvio: Number(formData.costoEnvio) || 0,
      vigenciaDias: Number(formData.vigenciaDias) || 7,
      comentarioInterno: formData.comentarioInterno,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Responder cotización</DialogTitle>
      <DialogContent dividers>
        <Stack component="form" id="quote-response-form" spacing={2.5} onSubmit={handleSubmit}>
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
              title="Resumen general de personalización"
              detail={quote?.detalle_personalizacion || {}}
            />
          )}

          <Divider />

          {items.map((item) => {
            const hasPersonalization =
              item.detalle_personalizacion?.modo === 'personalizado' ||
              (item.personalizaciones || []).length > 0;
            const suggested = getSuggestedUnitPrice(item);

            return (
              <Box key={item.id}>
                <Stack spacing={1.25}>
                  <Stack spacing={0.25}>
                    <Typography variant="subtitle2" fontWeight={900}>
                      {item.nombre_producto}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.nombre_variante || item.codigoproducto || 'Variante'}
                    </Typography>
                  </Stack>

                  {item.notas_cliente && (
                    <Alert severity="info">
                      Detalle del cliente: {item.notas_cliente}
                    </Alert>
                  )}

                  {hasPersonalization ? (
                    <PersonalizationRequestSummary
                      title="Personalización solicitada"
                      detail={item.detalle_personalizacion || {}}
                      personalizations={item.personalizaciones || []}
                      compact
                    />
                  ) : (
                    <Alert severity="success">
                      Producto estándar.
                    </Alert>
                  )}

                  {suggested > 0 && (
                    <Alert severity="warning">
                      Precio sugerido: <strong>{formatCurrency(suggested)}</strong>.
                    </Alert>
                  )}

                  <Grid container spacing={1.5} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        label="Cantidad"
                        type="number"
                        value={item.cantidad}
                        onChange={(event) => handleItemChange(item.id, 'cantidad', event.target.value)}
                        fullWidth
                        required
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        label="Precio unitario final"
                        type="number"
                        value={item.precio_cotizado}
                        onChange={(event) => handleItemChange(item.id, 'precio_cotizado', event.target.value)}
                        fullWidth
                        required
                        slotProps={{ htmlInput: { min: 0.01, step: '0.01' } }}
                        helperText="Incluye personalización si corresponde."
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Comentario del item para el cliente"
                        value={item.comentario_admin}
                        onChange={(event) => handleItemChange(item.id, 'comentario_admin', event.target.value)}
                        fullWidth
                        helperText="Detalle visible para el cliente."
                      />
                    </Grid>
                  </Grid>
                </Stack>

                <Divider sx={{ mt: 2 }} />
              </Box>
            );
          })}

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                name="descuento"
                label="Descuento"
                type="number"
                value={formData.descuento}
                onChange={handleFormChange}
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                name="costoEnvio"
                label="Costo envío"
                type="number"
                value={formData.costoEnvio}
                onChange={handleFormChange}
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                name="vigenciaDias"
                label="Vigencia días"
                type="number"
                value={formData.vigenciaDias}
                onChange={handleFormChange}
                fullWidth
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </Grid>
          </Grid>

          <TextField
            name="respuestaAdmin"
            label="Respuesta para el cliente"
            value={formData.respuestaAdmin}
            onChange={handleFormChange}
            multiline
            minRows={3}
            fullWidth
            required
            helperText="Mensaje visible para el cliente."
          />

          <TextField
            name="comentarioInterno"
            label="Comentario interno"
            value={formData.comentarioInterno}
            onChange={handleFormChange}
            multiline
            minRows={2}
            fullWidth
          />

          <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
            <Typography variant="body2">Subtotal: <strong>{formatCurrency(subtotal)}</strong></Typography>
            <Typography variant="body2">Total: <strong>{formatCurrency(total)}</strong></Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button type="submit" form="quote-response-form" variant="contained" disabled={loading}>
          Enviar respuesta
        </Button>
      </DialogActions>
    </Dialog>
  );
};
