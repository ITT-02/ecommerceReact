// Página administrativa: Personalización de tienda.
// Configura textos básicos y datos comerciales visibles en la tienda.

import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';

import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useResourceTable } from '../../../hooks/admin/useResourceTable';

const defaultConfig = {
  id: '',
  nombre_tienda: 'Aliqora Empaques',
  slogan: 'Empaques premium para tu marca',
  telefono_atencion: '',
  correo_atencion: '',
  whatsapp: '',
  direccion: '',
  mensaje_topbar: 'Empaques premium para cajas, bolsas y presentación de marca',
};

export const StoreCustomizationPage = () => {
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');

  const { rows, loading, error, saving, save } = useResourceTable({
    queryKey: ['store-customization-admin'],
    table: 'configuracion_tienda',
    pageNumber: 1,
    pageSize: 1,
    order: 'created_at.asc',
  });

  const currentConfig = rows[0] || defaultConfig;
  const [form, setForm] = useState(null);
  const effectiveForm = form || { ...defaultConfig, ...currentConfig };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...(current || effectiveForm), [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!effectiveForm.nombre_tienda.trim()) {
      setFormError('Ingresa el nombre de la tienda.');
      return;
    }

    try {
      await save(effectiveForm);
      setNotice('Personalización de tienda guardada.');
      setForm(null);
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message);
    }
  };

  return (
    <PlaceholderPage
      title="Personalización de tienda"
      description="Administra textos y datos comerciales que se mostrarán en la tienda pública."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error || formError} />
        {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}
        <Card variant="outlined">
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={900}>Datos de tienda</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}><TextField required fullWidth name="nombre_tienda" label="Nombre de tienda" value={effectiveForm.nombre_tienda || ''} onChange={handleChange} /></Grid>
                  <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth name="slogan" label="Slogan" value={effectiveForm.slogan || ''} onChange={handleChange} /></Grid>
                  <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth name="telefono_atencion" label="Teléfono" value={effectiveForm.telefono_atencion || ''} onChange={handleChange} /></Grid>
                  <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth name="whatsapp" label="WhatsApp" value={effectiveForm.whatsapp || ''} onChange={handleChange} /></Grid>
                  <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth name="correo_atencion" label="Correo" type="email" value={effectiveForm.correo_atencion || ''} onChange={handleChange} /></Grid>
                  <Grid size={{ xs: 12 }}><TextField fullWidth name="direccion" label="Dirección" value={effectiveForm.direccion || ''} onChange={handleChange} /></Grid>
                  <Grid size={{ xs: 12 }}><TextField fullWidth name="mensaje_topbar" label="Mensaje superior de tienda" value={effectiveForm.mensaje_topbar || ''} onChange={handleChange} /></Grid>
                </Grid>
                <Button type="submit" variant="contained" disabled={loading || saving} sx={{ alignSelf: { xs: 'stretch', sm: 'flex-end' } }}>
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
