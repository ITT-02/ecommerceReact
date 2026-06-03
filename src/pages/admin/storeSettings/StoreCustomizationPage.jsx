// Página administrativa: Personalización de tienda.
// Conecta datos visibles del ecommerce, contacto y WhatsApp flotante.

import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Divider, FormControlLabel, Grid, Stack, Switch, TextField, Typography } from '@mui/material';

import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { LoadingScreen } from '../../../components/common/LoadingScreen';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useAdminStoreSettings } from '../../../hooks/store/useStoreSettings';
import { DEFAULT_STORE_SETTINGS, normalizeStoreSettings } from '../../../services/store/storeSettingsService';

export const StoreCustomizationPage = () => {
  const [formError, setFormError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [form, setForm] = useState(normalizeStoreSettings(DEFAULT_STORE_SETTINGS));

  const { settings, loading, saving, error, saveSettings } = useAdminStoreSettings();

  useEffect(() => {
    setForm(normalizeStoreSettings(settings));
  }, [settings]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFormError('');
    setSavedMessage('');
  };

  const handleMetadataChange = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      metadata: {
        ...(current.metadata || {}),
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
    setFormError('');
    setSavedMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.nombre_tienda.trim()) {
      setFormError('Ingresa el nombre de la tienda.');
      return;
    }

    try {
      await saveSettings(form);
      setSavedMessage('Configuración guardada correctamente.');
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'No se pudo guardar la configuración.';
      setFormError(message);
    }
  };

  if (loading) return <LoadingScreen message="Cargando configuración de tienda..." />;

  return (
    <PlaceholderPage
      title="Personalización de tienda"
      description="Administra textos, datos de contacto y WhatsApp que se muestran en la tienda pública."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error || formError} />
        {savedMessage && (
          <Alert severity="success" onClose={() => setSavedMessage('')}>
            {savedMessage}
          </Alert>
        )}

        <Card variant="outlined">
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>Datos visibles de tienda</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Esta información se muestra en el menú, pie de página, contacto y botón flotante de WhatsApp.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField required fullWidth name="nombre_tienda" label="Nombre de tienda" value={form.nombre_tienda || ''} onChange={handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth name="slogan" label="Slogan" value={form.slogan || ''} onChange={handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth name="telefono_atencion" label="Teléfono" value={form.telefono_atencion || ''} onChange={handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth name="whatsapp" label="WhatsApp" helperText="Ejemplo: 984000000 o +51 984000000" value={form.whatsapp || ''} onChange={handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth name="correo_atencion" label="Correo" type="email" value={form.correo_atencion || ''} onChange={handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth name="direccion" label="Dirección" value={form.direccion || ''} onChange={handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth name="logo_url" label="URL pública del logo" helperText="Usa el enlace público generado por Storage o deja vacío para usar el logo local." value={form.logo_url || ''} onChange={handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth name="mensaje_topbar" label="Mensaje superior de tienda" value={form.mensaje_topbar || ''} onChange={handleChange} />
                  </Grid>
                </Grid>

                <Divider />

                <Box>
                  <Typography variant="h6" fontWeight={900}>WhatsApp y atención</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Define el mensaje que se abrirá automáticamente cuando el cliente presione WhatsApp.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      name="mensaje_whatsapp_default"
                      label="Mensaje predeterminado de WhatsApp"
                      value={form.metadata?.mensaje_whatsapp_default || ''}
                      onChange={handleMetadataChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      name="horario_atencion"
                      label="Horario de atención"
                      value={form.metadata?.horario_atencion || ''}
                      onChange={handleMetadataChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.metadata?.mostrar_whatsapp_flotante !== false}
                          onChange={handleMetadataChange}
                          name="mostrar_whatsapp_flotante"
                        />
                      }
                      label="Mostrar botón flotante de WhatsApp"
                    />
                  </Grid>
                </Grid>

                <Button type="submit" variant="contained" disabled={saving} sx={{ alignSelf: { xs: 'stretch', sm: 'flex-end' } }}>
                  {saving ? 'Guardando...' : 'Guardar configuración'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </PlaceholderPage>
  );
};
