import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { ErrorMessage } from '../../components/common/ErrorMessage';
import { useCommercialPartnerAccountRequest } from '../../hooks/partners/useCommercialPartners';

export const CommercialPartnerRequestPage = () => {
  const [form, setForm] = useState({
    negocioNombre: '',
    ruc: '',
    telefono: '',
    mensaje: '',
  });
  const [localError, setLocalError] = useState('');

  const { requestAccount, sending, success, error } = useCommercialPartnerAccountRequest();

  const updateField = (field, value) => {
    setLocalError('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.negocioNombre.trim()) {
      setLocalError('Ingresa el nombre comercial o razón social.');
      return;
    }

    if (!form.mensaje.trim()) {
      setLocalError('Cuéntanos qué tipo de productos deseas vender con Aliqora.');
      return;
    }

    await requestAccount(form);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 7 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 46 } }}>
              Solicitud de socio comercial
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 680 }}>
              Envía tus datos para que Aliqora evalúe tu acceso como socio comercial. Al aprobarse, podrás proponer productos y revisar su seguimiento.
            </Typography>
          </Box>

          <ErrorMessage message={localError || error} />

          {success && (
            <Alert
              severity="success"
              action={(
                <Button component={RouterLink} to="/mis-solicitudes" color="inherit" size="small">
                  Ver estado
                </Button>
              )}
            >
              Solicitud enviada. Aliqora revisará tu información y activará el rol si corresponde.
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={(theme) => ({
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.palette.custom.radius.xs,
              p: { xs: 2, md: 3 },
              bgcolor: 'background.paper',
            })}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 7 }}>
                <TextField
                  label="Negocio o razón social"
                  value={form.negocioNombre}
                  onChange={(event) => updateField('negocioNombre', event.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  label="RUC o documento"
                  value={form.ruc}
                  onChange={(event) => updateField('ruc', event.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  label="Teléfono / WhatsApp"
                  value={form.telefono}
                  onChange={(event) => updateField('telefono', event.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Mensaje"
                  value={form.mensaje}
                  onChange={(event) => updateField('mensaje', event.target.value)}
                  fullWidth
                  multiline
                  minRows={4}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button type="submit" variant="contained" size="large" disabled={sending}>
                  Enviar solicitud
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
