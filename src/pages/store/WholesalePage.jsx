/**
 * Página pública Mayoristas.
 */

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { AdminDialog } from '../../components/common/adminDialog/AdminDialog';
import { StoreFeatureCard } from '../../components/store/marketing/StoreFeatureCard';
import { StoreSectionHeader } from '../../components/store/marketing/StoreSectionHeader';
import { WholesaleStepsSection } from '../../components/store/marketing/WholesaleStepsSection';
import { wholesalePageContent } from '../../data/storePageContent';
import { useAuth } from '../../hooks/auth/useAuth';
import { requestWholesaleAccount } from '../../services/store/storeCatalogService';

export const WholesalePage = () => {
  const { hero, benefits, steps, cta } = wholesalePageContent;
  const navigate = useNavigate();
  const { user } = useAuth();
  const requestMutation = useMutation({ mutationFn: requestWholesaleAccount });
  const [requestOpen, setRequestOpen] = useState(false);
  const [form, setForm] = useState({
    negocioNombre: '',
    ruc: '',
    giroNegocio: '',
    volumenEstimado: '',
    telefono: '',
    mensaje: '',
  });
  const [formError, setFormError] = useState('');

  const openWholesaleRequest = () => {
    if (!user) {
      navigate('/login', { state: { from: '/mayoristas' } });
      return;
    }

    setRequestOpen(true);
  };

  const updateField = (field, value) => {
    setFormError('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleWholesaleRequest = async (event) => {
    event.preventDefault();

    if (!form.negocioNombre.trim()) {
      setFormError('Ingresa el nombre comercial o razón social.');
      return;
    }

    if (!form.mensaje.trim()) {
      setFormError('Cuéntanos qué tipo de compra recurrente deseas coordinar.');
      return;
    }

    await requestMutation.mutateAsync(form);
    setRequestOpen(false);
  };

  return (
    <Box sx={(theme) => ({ bgcolor: theme.palette.custom.semantic.storeMarketing.lightBg })}>
      {/* =========================================================
          HERO MAYORISTA
      ========================================================= */}
      <Box
        component="section"
        sx={(theme) => {
          const m = theme.palette.custom.semantic.storeMarketing;

          return {
            py: { xs: 7, md: 10 },
            bgcolor: m.lightBg,
            borderBottom: `1px solid ${m.lightBorder}`,
          };
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 4, md: 7 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2.25} sx={{ maxWidth: 790 }}>
                <Typography
                  variant="overline"
                  component="p"
                  sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.mauveAccent, fontWeight: 800, letterSpacing: '0.22em' })}
                >
                  {hero.eyebrow}
                </Typography>

                <Typography
                  variant="h1"
                  sx={(theme) => ({
                    color: theme.palette.custom.semantic.storeMarketing.lightText,
                    fontSize: { xs: '2rem', sm: '2.45rem', md: '3rem' },
                    lineHeight: 1.1,
                    maxWidth: 820,
                  })}
                >
                  {hero.title}
                </Typography>

                <Typography
                  variant="body1"
                  sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.lightMuted, maxWidth: 680, lineHeight: 1.75 })}
                >
                  {hero.description}
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                  <Button variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} onClick={openWholesaleRequest} disabled={requestMutation.isPending}>
                    {hero.primaryAction.label}
                  </Button>
                  <Button
                    component={RouterLink}
                    to={hero.secondaryAction.to}
                    variant="outlined"
                    size="large"
                    sx={(theme) => {
                      const m = theme.palette.custom.semantic.storeMarketing;

                      return {
                        color: m.wineAccent,
                        borderColor: m.mauveBorder,
                        '&:hover': { borderColor: m.mauveAccent, bgcolor: m.mauveBg },
                      };
                    }}
                  >
                    {hero.secondaryAction.label}
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Card
                sx={(theme) => {
                  const m = theme.palette.custom.semantic.storeMarketing;

                  return {
                    borderRadius: theme.palette.custom.radius.xs,
                    bgcolor: m.heroCardBg,
                    color: m.darkText,
                    backgroundImage: 'none',
                    border: `1px solid ${m.darkBorder}`,
                    boxShadow: theme.palette.custom.shadows.lg,
                    overflow: 'hidden',
                  };
                }}
              >
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Box sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={(theme) => ({
                        width: 48,
                        height: 48,
                        borderRadius: theme.palette.custom.radius.xs,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: theme.palette.custom.semantic.storeMarketing.darkAccentSoft,
                        color: theme.palette.custom.semantic.storeMarketing.darkAccent,
                        border: `1px solid ${theme.palette.custom.semantic.storeMarketing.darkBorder}`,
                        flexShrink: 0,
                      })}
                    >
                      <GroupsOutlinedIcon />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.darkText })}>
                        Condiciones comerciales
                      </Typography>
                      <Typography variant="body2" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.darkMuted })}>
                        Para negocios con compras recurrentes o por volumen.
                      </Typography>
                    </Box>
                  </Box>

                  {hero.metrics.map((metric) => (
                    <Box
                      key={metric.label}
                      sx={(theme) => ({
                        p: { xs: 2, md: 2.5 },
                        borderTop: `1px solid ${theme.palette.custom.semantic.storeMarketing.darkDivider}`,
                      })}
                    >
                      <Typography
                        variant="h3"
                        sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.darkAccent, fontSize: { xs: '1.45rem', md: '1.75rem' } })}
                      >
                        {metric.value}
                      </Typography>
                      <Typography variant="body2" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.darkMuted })}>
                        {metric.label}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* =========================================================
          BENEFICIOS
      ========================================================= */}
      <Box component="section" sx={(theme) => ({ bgcolor: theme.palette.custom.semantic.storeMarketing.freshBg, py: { xs: 7, md: 9 } })}>
        <Container maxWidth="xl">
          <StoreSectionHeader
            eyebrow="Beneficios"
            title="Condiciones pensadas para negocios"
            description="Una entrada comercial clara para clientes por volumen: beneficios, solicitud y contacto sin saturar la experiencia."
            align="left"
            accent="sage"
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 3 }}>
            {benefits.map((benefit, index) => (
              <StoreFeatureCard
                key={benefit.title}
                iconKey={benefit.iconKey}
                title={benefit.title}
                description={benefit.description}
                align="left"
                accent={index === 0 ? 'gold' : index === 1 ? 'mauve' : 'sage'}
              />
            ))}
          </Box>
        </Container>
      </Box>

      <WholesaleStepsSection steps={steps} />

      {/* =========================================================
          CTA MAYORISTA
      ========================================================= */}
      <Box
        component="section"
        sx={(theme) => {
          const m = theme.palette.custom.semantic.storeMarketing;

          return {
            bgcolor: m.darkBgAlt,
            py: { xs: 7, md: 8 },
            borderTop: `1px solid ${m.darkBorder}`,
          };
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={2.5} sx={{ textAlign: 'center', alignItems: 'center' }}>
            <StoreSectionHeader eyebrow={cta.eyebrow} title={cta.title} description={cta.description} tone="dark" />
            {requestMutation.isSuccess && (
              <Alert
                severity="success"
                sx={{ width: '100%' }}
                action={(
                  <Button component={RouterLink} to="/mis-solicitudes" color="inherit" size="small">
                    Ver estado
                  </Button>
                )}
              >
                Solicitud enviada. Aliqora revisará tu cuenta antes de activar precios mayoristas.
              </Alert>
            )}
            {requestMutation.error && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {requestMutation.error?.response?.data?.message || requestMutation.error?.message || 'No se pudo enviar la solicitud.'}
              </Alert>
            )}
            <Button variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} onClick={openWholesaleRequest} disabled={requestMutation.isPending}>
              {cta.action.label}
            </Button>
          </Stack>
        </Container>
      </Box>

      <AdminDialog
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title="Solicitar cuenta mayorista"
        maxWidth="sm"
        loading={requestMutation.isPending}
        onSubmit={handleWholesaleRequest}
        actions={(
          <>
            <Button type="button" onClick={() => setRequestOpen(false)} disabled={requestMutation.isPending}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={requestMutation.isPending}>
              Enviar solicitud
            </Button>
          </>
        )}
      >
        <Stack spacing={2}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField label="Negocio o razón social" value={form.negocioNombre} onChange={(event) => updateField('negocioNombre', event.target.value)} fullWidth required />
          <TextField label="RUC o documento" value={form.ruc} onChange={(event) => updateField('ruc', event.target.value)} fullWidth />
          <TextField label="Giro del negocio" value={form.giroNegocio} onChange={(event) => updateField('giroNegocio', event.target.value)} fullWidth />
          <TextField label="Volumen estimado" value={form.volumenEstimado} onChange={(event) => updateField('volumenEstimado', event.target.value)} fullWidth />
          <TextField label="Teléfono / WhatsApp" value={form.telefono} onChange={(event) => updateField('telefono', event.target.value)} fullWidth />
          <TextField label="Mensaje" value={form.mensaje} onChange={(event) => updateField('mensaje', event.target.value)} fullWidth multiline minRows={3} required />
        </Stack>
      </AdminDialog>
    </Box>
  );
};
