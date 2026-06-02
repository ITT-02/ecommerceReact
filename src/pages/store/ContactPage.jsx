/**
 * Página pública Contacto.
 */

import { useMemo, useState } from 'react';

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { StoreSectionHeader } from '../../components/store/marketing/StoreSectionHeader';
import { getStoreMarketingIcon } from '../../components/store/marketing/storeMarketingIcons';
import { contactPageContent } from '../../data/storePageContent';
import FaqAcordion from './FaqAcordion';
const normalizeReasonFromQuery = (value, reasons) => {
  if (!value) return reasons[0];
  const cleanValue = value.toLowerCase();
  if (cleanValue.includes('mayorista')) return 'Registro como mayorista';
  if (cleanValue.includes('cotizacion') || cleanValue.includes('cotización')) return 'Cotización personalizada';
  if (cleanValue.includes('pedido')) return 'Seguimiento de pedido';
  return reasons[0];
};

const ContactChannelCard = ({ channel }) => {
  const Icon = getStoreMarketingIcon(channel.iconKey);

  const content = (
    <Card
      sx={(theme) => {
        const m = theme.palette.custom.semantic.storeMarketing;
        return {
          height: '100%',
          borderRadius: theme.palette.custom.radius.xs,
          backgroundImage: 'none',
          bgcolor: m.lightCardBg,
          border: `1px solid ${m.lightCardBorder}`,
          boxShadow: theme.palette.custom.shadows.sm,
          transition: `transform ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}, border-color ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}`,
          '&:hover': {
            transform: channel.href ? 'translateY(-2px)' : 'none',
            borderColor: channel.href ? m.lightAccent : m.lightCardBorder,
          },
        };
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" spacing={1.75} sx={{ alignItems: 'flex-start' }}>
          <Box
            sx={(theme) => {
              const m = theme.palette.custom.semantic.storeMarketing;
              return {
                width: 46,
                height: 46,
                borderRadius: theme.palette.custom.radius.xs,
                display: 'grid',
                placeItems: 'center',
                bgcolor: m.iconBg,
                color: m.iconText,
                border: `1px solid ${m.lightCardBorder}`,
                flexShrink: 0,
              };
            }}
          >
            <Icon sx={{ fontSize: 23 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.lightAccent, fontWeight: 800, letterSpacing: '0.12em' })}>
              {channel.label}
            </Typography>
            <Typography variant="subtitle1" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.lightText, fontWeight: 800, overflowWrap: 'anywhere' })}>
              {channel.value}
            </Typography>
            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.lightMuted })}>
              {channel.helper}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  if (!channel.href) return content;

  return (
    <Box component="a" href={channel.href} target={channel.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" sx={{ textDecoration: 'none' }}>
      {content}
    </Box>
  );
};

export const ContactPage = () => {
  const [searchParams] = useSearchParams();
  const { hero, channels, reasons, faqs } = contactPageContent;

  const defaultReason = useMemo(
    () => normalizeReasonFromQuery(searchParams.get('motivo'), reasons),
    [reasons, searchParams],
  );

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    motivo: defaultReason,
    mensaje: '',
  });
  const [sent, setSent] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <Box sx={(theme) => ({ bgcolor: theme.palette.custom.semantic.storeMarketing.lightBg })}>
      <Box
        component="section"
        sx={(theme) => ({
          py: { xs: 7, md: 10 },
          bgcolor: theme.palette.custom.semantic.storeMarketing.darkBg,
          borderBottom: `1px solid ${theme.palette.custom.semantic.storeMarketing.darkBorder}`,
        })}
      >
        <Container maxWidth="lg">
          <StoreSectionHeader eyebrow={hero.eyebrow} title={hero.title} description={hero.description} tone="dark" />
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.lightAccent, fontWeight: 800, letterSpacing: '0.18em' })}>
                Canales de contacto
              </Typography>

              {channels.map((channel) => (
                <ContactChannelCard key={channel.label} channel={channel} />
              ))}

              <Box sx={{ pt: 2 }}>
                <Typography variant="h5" sx={(theme) => ({ mb: 1.5, color: theme.palette.custom.semantic.storeMarketing.lightText })}>
                  Preguntas frecuentes
                </Typography>
                <FaqAcordion items={faqs}/>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Card
              sx={(theme) => {
                const m = theme.palette.custom.semantic.storeMarketing;
                return {
                  borderRadius: theme.palette.custom.radius.xs,
                  backgroundImage: 'none',
                  bgcolor: m.lightCardBg,
                  border: `1px solid ${m.lightCardBorder}`,
                  boxShadow: theme.palette.custom.shadows.sm,
                };
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 4 }, '&:last-child': { pb: { xs: 2.5, md: 4 } } }}>
                <Stack spacing={1} sx={{ mb: 3 }}>
                  <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.lightAccent, fontWeight: 800, letterSpacing: '0.18em' })}>
                    Formulario de contacto
                  </Typography>
                  <Typography variant="h3" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.lightText })}>
                    Envíanos tu consulta
                  </Typography>
                  <Typography variant="body2" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.lightMuted })}>
                    Completa tus datos y el equipo comercial podrá responderte con mayor precisión.
                  </Typography>
                </Stack>

                {sent && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Solicitud registrada en pantalla. Cuando conectes este formulario al backend, aquí se enviará la consulta comercial.
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label="Nombre completo" name="nombre" value={formData.nombre} onChange={handleChange} required />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label="WhatsApp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+51 999 000 000" />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField select label="Motivo" name="motivo" value={formData.motivo} onChange={handleChange}>
                        {reasons.map((reason) => (
                          <MenuItem key={reason} value={reason}>
                            {reason}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Mensaje"
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        required
                        multiline
                        minRows={5}
                        placeholder="Cuéntanos qué producto buscas, cantidades aproximadas, destino de envío o número de pedido."
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Button type="submit" variant="contained" size="large" endIcon={<SendRoundedIcon />}>
                        Enviar consulta
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
