// Página de inicio pública.
// Landing comercial con acceso a catálogo, carrito, pedidos y perfil.


import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { Box, Button, Card, CardContent, Container, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { StoreFeatureCard } from '../../components/store/marketing/StoreFeatureCard';
import { StoreSectionHeader } from '../../components/store/marketing/StoreSectionHeader';

const highlights = [
  {
    title: 'Catálogo inteligente',
    description: 'Cajas, bolsas y empaques visibles por categoría, variante y disponibilidad.',
    iconKey: 'product',
    accent: 'sage',
  },
  {
    title: 'Compra bajo pedido',
    description: 'Productos sin stock pueden venderse cuando están habilitados para preparación especial.',
    iconKey: 'support',
    accent: 'mauve',
  },
  {
    title: 'Pagos y seguimiento',
    description: 'El cliente revisa pedidos, pagos y estados de envío desde su cuenta.',
    iconKey: 'quality',
    accent: 'gold',
  },
];

const experienceItems = [
  { label: 'Mayoristas', value: 'precios por volumen' },
  { label: 'Cotizaciones', value: 'personalización ordenada' },
  { label: 'Envíos', value: 'seguimiento con transportista' },
];

export const HomePage = () => {
  return (
    <Box sx={(theme) => ({ bgcolor: theme.palette.custom.semantic.storeMarketing.lightBg })}>
      {/* =========================================================
          HERO DE INICIO
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
              <Stack spacing={2.25} sx={{ maxWidth: 760 }}>
                <Typography
                  variant="overline"
                  component="p"
                  sx={(theme) => ({
                    color: theme.palette.custom.semantic.storeMarketing.mauveAccent,
                    fontWeight: 800,
                    letterSpacing: '0.22em',
                  })}
                >
                  Empaques premium
                </Typography>

                <Typography
                  variant="h1"
                  sx={(theme) => ({
                    color: theme.palette.custom.semantic.storeMarketing.lightText,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3.25rem' },
                    lineHeight: 1.08,
                    maxWidth: 780,
                  })}
                >
                  Soluciones de empaque para marcas que cuidan cada entrega
                </Typography>

                <Typography
                  variant="body1"
                  sx={(theme) => ({
                    color: theme.palette.custom.semantic.storeMarketing.lightMuted,
                    maxWidth: 680,
                    lineHeight: 1.75,
                  })}
                >
                  Compra cajas, bolsas y empaques con catálogo ordenado, opciones bajo pedido,
                  cotizaciones personalizadas y seguimiento claro hasta la entrega.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                  <Button component={RouterLink} to="/catalogo" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>
                    Ver catálogo
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/mayoristas"
                    variant="outlined"
                    size="large"
                    sx={(theme) => {
                      const m = theme.palette.custom.semantic.storeMarketing;

                      return {
                        color: m.wineAccent,
                        borderColor: m.mauveBorder,
                        '&:hover': {
                          borderColor: m.mauveAccent,
                          bgcolor: m.mauveBg,
                        },
                      };
                    }}
                  >
                    Programa mayorista
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
                    backgroundImage: 'none',
                    bgcolor: m.heroCardBg,
                    color: m.darkText,
                    border: `1px solid ${m.darkBorder}`,
                    boxShadow: theme.palette.custom.shadows.lg,
                    overflow: 'hidden',
                  };
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 }, '&:last-child': { pb: { xs: 3, md: 4 } } }}>
                  <Box
                    sx={(theme) => ({
                      width: 58,
                      height: 58,
                      borderRadius: theme.palette.custom.radius.xs,
                      display: 'grid',
                      placeItems: 'center',
                      mb: 3,
                      color: theme.palette.custom.semantic.storeMarketing.darkAccent,
                      bgcolor: theme.palette.custom.semantic.storeMarketing.darkAccentSoft,
                      border: `1px solid ${theme.palette.custom.semantic.storeMarketing.darkBorder}`,
                    })}
                  >
                    <StorefrontOutlinedIcon sx={{ fontSize: 30 }} />
                  </Box>

                  <Typography variant="h3" sx={(theme) => ({ mb: 1.5, color: theme.palette.custom.semantic.storeMarketing.darkText })}>
                    Compra simple, presentación premium
                  </Typography>
                  <Typography variant="body2" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.darkMuted, lineHeight: 1.75 })}>
                    Una experiencia pensada para clientes finales, mayoristas y pedidos personalizados.
                  </Typography>

                  <Box sx={{ display: 'grid', gap: 1.25, mt: 3 }}>
                    {experienceItems.map((item) => (
                      <Box
                        key={item.label}
                        sx={(theme) => ({
                          p: 1.5,
                          borderRadius: theme.palette.custom.radius.xs,
                          bgcolor: theme.palette.custom.semantic.storeMarketing.darkCardBg,
                          border: `1px solid ${theme.palette.custom.semantic.storeMarketing.darkCardBorder}`,
                        })}
                      >
                        <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.darkAccent, lineHeight: 1.2 })}>
                          {item.label}
                        </Typography>
                        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.darkMuted })}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* =========================================================
          BENEFICIOS DE LA TIENDA
      ========================================================= */}
      <Box component="section" sx={(theme) => ({ bgcolor: theme.palette.custom.semantic.storeMarketing.freshBg, py: { xs: 7, md: 9 } })}>
        <Container maxWidth="xl">
          <StoreSectionHeader
            eyebrow="Experiencia de compra"
            title="Todo lo necesario para vender y entregar mejor"
            description="El cliente puede navegar productos, seleccionar variantes, solicitar cotización, pagar y revisar el estado de su pedido."
            accent="sage"
          />

          <Grid container spacing={2.5}>
            {highlights.map((item) => (
              <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                <StoreFeatureCard
                  iconKey={item.iconKey}
                  title={item.title}
                  description={item.description}
                  accent={item.accent}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* =========================================================
          ACCESOS COMERCIALES
      ========================================================= */}
      <Box
        component="section"
        sx={(theme) => {
          const m = theme.palette.custom.semantic.storeMarketing;

          return {
            bgcolor: m.darkBgAlt,
            py: { xs: 6, md: 7 },
            borderTop: `1px solid ${m.darkBorder}`,
            borderBottom: `1px solid ${m.darkBorder}`,
          };
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.darkAccent, fontWeight: 800, letterSpacing: '0.2em' })}>
                Atención comercial
              </Typography>
              <Typography variant="h2" sx={(theme) => ({ mt: 1, color: theme.palette.custom.semantic.storeMarketing.darkText })}>
                ¿Necesitas precios por volumen o empaques personalizados?
              </Typography>
              <Typography variant="body1" sx={(theme) => ({ mt: 1.5, color: theme.palette.custom.semantic.storeMarketing.darkMuted, lineHeight: 1.75 })}>
                Te ayudamos a elegir medidas, cantidades, materiales y alternativas de abastecimiento según tu negocio.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1.5}>
                <Button component={RouterLink} to="/contacto?motivo=cotizacion" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>
                  Solicitar cotización
                </Button>
                <Button
                  component={RouterLink}
                  to="/nuestra-historia"
                  variant="outlined"
                  size="large"
                  sx={(theme) => {
                    const m = theme.palette.custom.semantic.storeMarketing;

                    return {
                      color: m.darkText,
                      borderColor: m.darkBorder,
                      '&:hover': {
                        borderColor: m.darkAccent,
                        bgcolor: m.darkAccentSoft,
                      },
                    };
                  }}
                >
                  Conocer Aliqora
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};
