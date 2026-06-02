// Campos reutilizables para seleccionar transportista y registrar datos de rastreo.
// Se usa en pedidos y envíos para no duplicar lógica.

import { useMemo } from 'react';
import { Alert, Grid, MenuItem, TextField } from '@mui/material';

import { useCarrierOptions } from '../../../hooks/logistics/useShipments';

const replaceTrackingToken = (url = '', trackingNumber = '') => {
  const cleanUrl = String(url || '').trim();
  const cleanTracking = String(trackingNumber || '').trim();

  if (!cleanUrl) return '';
  if (!cleanTracking) return cleanUrl;

  const encodedTracking = encodeURIComponent(cleanTracking);

  return cleanUrl
    .replaceAll('{tracking}', encodedTracking)
    .replaceAll('{numero}', encodedTracking)
    .replaceAll('{guia}', encodedTracking);
};

const hasTrackingToken = (url = '') => {
  return /\{(tracking|numero|guia)\}/i.test(String(url || ''));
};

export const CarrierTrackingFields = ({
  form,
  loading = false,
  required = false,
  requiredTrackingNumber = false,
  onChange,
  showRequiredError = false,
  showTrackingNumberError = false,
}) => {
  const {
    data: carriers = [],
    isLoading: loadingCarriers,
    error,
  } = useCarrierOptions();

  const selectedCarrier = useMemo(() => {
    return carriers.find(
      (carrier) => String(carrier.id) === String(form?.transportistaId)
    );
  }, [carriers, form?.transportistaId]);

  const carrierRequiredError =
    Boolean(showRequiredError) && Boolean(required) && !form?.transportistaId;

  const trackingNumberRequiredError =
    Boolean(showTrackingNumberError) &&
    Boolean(requiredTrackingNumber) &&
    !form?.numeroSeguimiento?.trim();

  const hasCarriers = carriers.length > 0;
  const hasSelectedCarrier = Boolean(form?.transportistaId);

  const shouldShowCarrierLoadError =
    Boolean(error) &&
    !loadingCarriers &&
    !hasCarriers &&
    !hasSelectedCarrier;

  const handleCarrierChange = (event) => {
    const transportistaId = event.target.value;

    const carrier = carriers.find(
      (item) => String(item.id) === String(transportistaId)
    );

    onChange?.('transportistaId', transportistaId);
    onChange?.('empresaEnvio', carrier?.nombre || '');

    if (!transportistaId) {
      onChange?.('urlSeguimiento', '');
      return;
    }

    const nextUrl = replaceTrackingToken(
      carrier?.url_rastreo_base,
      form?.numeroSeguimiento
    );

    if (
      nextUrl &&
      (!form?.urlSeguimiento || hasTrackingToken(carrier?.url_rastreo_base))
    ) {
      onChange?.('urlSeguimiento', nextUrl);
    }
  };

  const handleTrackingNumberChange = (event) => {
    const numeroSeguimiento = event.target.value;

    onChange?.('numeroSeguimiento', numeroSeguimiento);

    if (
      selectedCarrier?.url_rastreo_base &&
      hasTrackingToken(selectedCarrier.url_rastreo_base)
    ) {
      onChange?.(
        'urlSeguimiento',
        replaceTrackingToken(
          selectedCarrier.url_rastreo_base,
          numeroSeguimiento
        )
      );
    }
  };

  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          required={required}
          fullWidth
          name="transportistaId"
          label="Empresa transportista"
          value={form?.transportistaId || ''}
          disabled={loading || loadingCarriers}
          onChange={handleCarrierChange}
          error={carrierRequiredError}
          helperText={
            carrierRequiredError
              ? 'Selecciona la empresa transportista para registrar este avance.'
              : selectedCarrier
                ? `Seleccionado: ${selectedCarrier.nombre}`
                : form?.empresaEnvio
                  ? `Seleccionado: ${form.empresaEnvio}`
                  : 'Selecciona el transportista encargado de la entrega.'
          }
        >
          <MenuItem value="">
            Seleccionar transportista
          </MenuItem>

          {carriers.map((carrier) => (
            <MenuItem key={carrier.id} value={carrier.id}>
              {carrier.nombre}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          required={requiredTrackingNumber}
          name="numeroSeguimiento"
          label={'Número de guía / seguimiento'}
          placeholder="Ingrese el número de guía si ya fue generado."
          value={form?.numeroSeguimiento || ''}
          disabled={loading}
          onChange={handleTrackingNumberChange}
          error={trackingNumberRequiredError}
          helperText={
            trackingNumberRequiredError
              ? 'Ingresa el número de guía para continuar con este estado.'
              : undefined
          }
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          name="urlSeguimiento"
          label="Enlace de rastreo"
          type="url"
          value={form?.urlSeguimiento || ''}
          disabled={loading}
          onChange={(event) => onChange?.('urlSeguimiento', event.target.value)}
          helperText="Puede quedar como URL base o URL directa de seguimiento."
        />
      </Grid>

      {shouldShowCarrierLoadError && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="warning" variant="outlined">
            No se pudieron cargar los transportistas. Revisa la conexión o permisos.
          </Alert>
        </Grid>
      )}
    </Grid>
  );
};