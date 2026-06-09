// Página de inicio pública.
// Los banners vigentes se administran desde Marketing > Banners de tienda.
// El primer banner activo se usa como fondo horizontal del hero;
// si no hay uno vigente o no tiene imagen, se muestra contenido por defecto con fondo de marca.

import { useEffect, useMemo, useState } from 'react';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';

import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import { StoreFeatureCard } from '../../components/store/marketing/StoreFeatureCard';
import { StoreSectionHeader } from '../../components/store/marketing/StoreSectionHeader';
import { useStoreMarketing } from '../../hooks/store/useStoreMarketing';

const HERO_ROTATION_MS = 5200;

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

const getBannerUrlConfig = (banner) => {
  const url = banner?.url_destino || '/catalogo';

  return {
    url,
    isExternal: url.startsWith('http'),
  };
};

const HomeSecondaryBanners = ({ banners = [] }) => {
  if (!banners.length) return null;

  return (
    <Box
      component="section"
      sx={(theme) => ({
        py: { xs: 3.5, md: 5 },
        bgcolor: theme.palette.custom.semantic.storeMarketing.lightBg,
      })}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            width: '100%',
            maxWidth: 1240,
            mx: 'auto',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2.5}
            useFlexGap
            sx={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {banners.map((banner) => {
              const { url, isExternal } = getBannerUrlConfig(banner);
              const hasImage = Boolean(banner?.imagen_url);

              return (
                <Paper
                  key={banner.id}
                  elevation={0}
                  sx={(theme) => {
                    const m = theme.palette.custom.semantic.storeMarketing;

                    return {
                      position: 'relative',
                      width: {
                        xs: '100%',
                        sm: 620,
                        md: banners.length === 1 ? 640 : 520,
                      },
                      maxWidth: '100%',
                      minHeight: { xs: 220, md: 240 },
                      borderRadius: 4,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      border: `1px solid ${m.lightCardBorder}`,
                      bgcolor: m.lightCardBg,
                      background: hasImage
                        ? undefined
                        : `linear-gradient(135deg, ${m.lightBgAlt} 0%, ${m.lightBg} 58%, ${m.mauveBg} 100%)`,
                      backgroundImage: hasImage ? `url("${banner.imagen_url}")` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      boxShadow: theme.palette.custom.shadows.sm,
                      transition: 'transform 180ms ease, box-shadow 180ms ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: theme.palette.custom.shadows.md,
                      },
                      '&::before': hasImage
                        ? {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            background: `linear-gradient(
                              180deg,
                              ${alpha(theme.palette.common.black, 0.12)} 0%,
                              ${alpha(theme.palette.common.black, 0.28)} 48%,
                              ${alpha(theme.palette.common.black, 0.58)} 100%
                            )`,
                          }
                        : {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            background: `radial-gradient(circle at top right, ${alpha(
                              m.lightAccent,
                              0.12
                            )} 0%, transparent 36%)`,
                          },
                    };
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      width: '100%',
                      maxWidth: 430,
                      mx: 'auto',
                      p: { xs: 2.5, md: 3 },
                    }}
                  >
                    <Stack spacing={1.2} sx={{ alignItems: 'center' }}>
                      <Typography
                        variant="h5"
                        sx={(theme) => ({
                          color: hasImage
                            ? theme.palette.common.white
                            : theme.palette.custom.semantic.storeMarketing.lightText,
                          fontWeight: 900,
                          lineHeight: 1.15,
                        })}
                      >
                        {banner?.titulo || 'Campaña especial'}
                      </Typography>

                      {banner?.subtitulo && (
                        <Typography
                          variant="body2"
                          sx={(theme) => ({
                            color: hasImage
                              ? alpha(theme.palette.common.white, 0.86)
                              : theme.palette.custom.semantic.storeMarketing.lightMuted,
                            lineHeight: 1.6,
                            maxWidth: 390,
                          })}
                        >
                          {banner.subtitulo}
                        </Typography>
                      )}

                      <Box sx={{ pt: 0.5 }}>
                        <Button
                          component={isExternal ? 'a' : RouterLink}
                          to={isExternal ? undefined : url}
                          href={isExternal ? url : undefined}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noreferrer' : undefined}
                          variant={hasImage ? 'contained' : 'outlined'}
                          size="small"
                        >
                          {banner?.boton_texto || 'Ver más'}
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

const HomeHero = ({ banners = [], promotions = [] }) => {
  const safeHeroBanners = useMemo(() => (Array.isArray(banners) ? banners.filter(Boolean) : []), [banners]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (safeHeroBanners.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeHeroBanners.length);
    }, HERO_ROTATION_MS);

    return () => window.clearInterval(intervalId);
  }, [safeHeroBanners.length]);

  const normalizedActiveIndex = safeHeroBanners.length
    ? Math.min(activeIndex, safeHeroBanners.length - 1)
    : 0;
  const banner = safeHeroBanners[normalizedActiveIndex] || null;
  const { url: heroCtaUrl, isExternal: heroCtaIsExternal } = getBannerUrlConfig(banner);
  const hasBannerImage = Boolean(banner?.imagen_url);

  return (
    <Box
      component="section"
      sx={(theme) => {
        const m = theme.palette.custom.semantic.storeMarketing;

        return {
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: 430, md: 470 },
          display: 'flex',
          alignItems: 'center',
          py: { xs: 4, md: 5 },
          borderBottom: `1px solid ${m.lightBorder}`,
          background: hasBannerImage
            ? undefined
            : `linear-gradient(135deg, ${m.lightBg} 0%, ${m.lightBgAlt} 55%, ${m.mauveBg} 100%)`,
          backgroundImage: hasBannerImage ? `url("${banner.imagen_url}")` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: { xs: 'center center', md: 'center right' },
          backgroundRepeat: 'no-repeat',

          '&::before': hasBannerImage
            ? {
                content: '""',
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                background: {
                  xs: `linear-gradient(
                    180deg,
                    ${alpha(theme.palette.common.black, 0.52)} 0%,
                    ${alpha(theme.palette.common.black, 0.34)} 42%,
                    ${alpha(theme.palette.common.black, 0.14)} 70%,
                    transparent 100%
                  )`,
                  md: `linear-gradient(
                    90deg,
                    ${alpha(theme.palette.common.black, 0.74)} 0%,
                    ${alpha(theme.palette.common.black, 0.52)} 22%,
                    ${alpha(theme.palette.common.black, 0.24)} 42%,
                    ${alpha(theme.palette.common.black, 0.06)} 58%,
                    transparent 72%
                  )`,
                },
              }
            : {
                content: '""',
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                background: `radial-gradient(circle at top right, ${alpha(
                  m.lightAccent,
                  0.12
                )} 0%, transparent 30%)`,
              },
        };
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={1.6} sx={{ maxWidth: { xs: '100%', md: 700 } }}>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: 'wrap', alignItems: 'center' }}
          >
            <Chip
              icon={<CampaignOutlinedIcon />}
              label={banner?.titulo ? 'Campaña vigente' : 'Explora nuestros productos'}
              variant="outlined"
              sx={(theme) => {
                const m = theme.palette.custom.semantic.storeMarketing;

                return {
                  color: hasBannerImage ? theme.palette.common.white : m.lightAccent,
                  borderColor: hasBannerImage
                    ? alpha(theme.palette.common.white, 0.28)
                    : alpha(m.lightAccent, 0.38),
                  bgcolor: hasBannerImage
                    ? alpha(theme.palette.common.black, 0.18)
                    : alpha(m.lightBg, 0.76),
                  '& .MuiChip-icon': {
                    color: hasBannerImage ? theme.palette.common.white : m.lightAccent,
                  },
                };
              }}
            />

            {promotions.length > 0 && (
              <Chip
                label={`${promotions.length} promoción(es) activa(s)`}
                variant="outlined"
                sx={(theme) => {
                  const m = theme.palette.custom.semantic.storeMarketing;

                  return {
                    color: hasBannerImage ? theme.palette.common.white : m.lightAccent,
                    borderColor: hasBannerImage
                      ? alpha(theme.palette.common.white, 0.28)
                      : alpha(m.lightAccent, 0.38),
                    bgcolor: hasBannerImage
                      ? alpha(theme.palette.common.black, 0.16)
                      : alpha(m.lightBg, 0.76),
                  };
                }}
              />
            )}
          </Stack>

          <Typography
            variant="h1"
            sx={(theme) => ({
              color: hasBannerImage
                ? theme.palette.common.white
                : theme.palette.custom.semantic.storeMarketing.lightText,
              fontSize: { xs: '1.9rem', sm: '2.3rem', md: '3rem' },
              lineHeight: 1.08,
              maxWidth: 780,
              textShadow: hasBannerImage
                ? `0 3px 24px ${alpha(theme.palette.common.black, 0.42)}`
                : 'none',
            })}
          >
            {banner?.titulo || 'Empaques premium para cajas, bolsas y presentación de marca'}
          </Typography>

          <Typography
            variant="body1"
            sx={(theme) => ({
              color: hasBannerImage
                ? alpha(theme.palette.common.white, 0.84)
                : theme.palette.custom.semantic.storeMarketing.lightMuted,
              maxWidth: 620,
              lineHeight: 1.72,
              textShadow: hasBannerImage
                ? `0 2px 14px ${alpha(theme.palette.common.black, 0.3)}`
                : 'none',
            })}
          >
            {banner?.subtitulo ||
              'Compra cajas, bolsas y empaques con catálogo ordenado, cotizaciones personalizadas y atención clara para cada pedido.'}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 0.5 }}>
            <Button
              component={heroCtaIsExternal ? 'a' : RouterLink}
              to={heroCtaIsExternal ? undefined : heroCtaUrl}
              href={heroCtaIsExternal ? heroCtaUrl : undefined}
              target={heroCtaIsExternal ? '_blank' : undefined}
              rel={heroCtaIsExternal ? 'noreferrer' : undefined}
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
            >
              {banner?.boton_texto || 'Ver productos'}
            </Button>

            <Button
              component={RouterLink}
              to="/mayoristas"
              variant={hasBannerImage ? 'outlined' : 'text'}
              size="large"
              sx={(theme) => {
                const m = theme.palette.custom.semantic.storeMarketing;

                return hasBannerImage
                  ? {
                      color: theme.palette.common.white,
                      borderColor: alpha(theme.palette.common.white, 0.42),
                      bgcolor: alpha(theme.palette.common.black, 0.12),
                      '&:hover': {
                        borderColor: theme.palette.common.white,
                        bgcolor: alpha(theme.palette.common.black, 0.22),
                      },
                    }
                  : {
                      color: m.lightAccent,
                      fontWeight: 700,
                      '&:hover': {
                        bgcolor: alpha(m.lightAccent, 0.08),
                      },
                    };
              }}
            >
              Programa mayorista
            </Button>
          </Stack>

          {safeHeroBanners.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ pt: 0.75, alignItems: 'center' }}>
              {safeHeroBanners.map((item, index) => {
                const isActive = index === normalizedActiveIndex;

                return (
                  <Box
                    key={item.id || index}
                    component="button"
                    type="button"
                    aria-label={`Mostrar banner ${index + 1}`}
                    onClick={() => setActiveIndex(index)}
                    sx={(theme) => ({
                      width: isActive ? 28 : 9,
                      height: 9,
                      border: 0,
                      p: 0,
                      borderRadius: 999,
                      cursor: 'pointer',
                      bgcolor: hasBannerImage
                        ? alpha(theme.palette.common.white, isActive ? 0.92 : 0.44)
                        : alpha(theme.palette.custom.semantic.storeMarketing.lightAccent, isActive ? 0.9 : 0.28),
                      transition: theme.transitions.create(['width', 'background-color', 'opacity'], {
                        duration: theme.transitions.duration.shortest,
                      }),
                    })}
                  />
                );
              })}
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export const HomePage = () => {
  const { banners = [], promotions = [] } = useStoreMarketing();

  const safeBanners = Array.isArray(banners) ? banners : [];
  const safePromotions = Array.isArray(promotions) ? promotions : [];

  const explicitHeroBanners = safeBanners.filter(
    (banner) => banner.ubicacion_home === 'carrusel_principal'
  );
  const heroBanners = explicitHeroBanners.length ? explicitHeroBanners : safeBanners.slice(0, 1);
  const heroIds = new Set(heroBanners.map((banner) => banner.id));
  const explicitSecondaryBanners = safeBanners.filter(
    (banner) => banner.ubicacion_home === 'tarjeta_secundaria'
  );
  const secondaryBanners = (explicitSecondaryBanners.length
    ? explicitSecondaryBanners
    : safeBanners.filter((banner) => !heroIds.has(banner.id))
  ).slice(0, 4);

  return (
    <Box sx={(theme) => ({ bgcolor: theme.palette.custom.semantic.storeMarketing.lightBg })}>
      <HomeHero banners={heroBanners} promotions={safePromotions} />

      <HomeSecondaryBanners banners={secondaryBanners} />

      <Box
        component="section"
        sx={(theme) => ({
          bgcolor: theme.palette.custom.semantic.storeMarketing.freshBg,
          py: { xs: 7, md: 9 },
        })}
      >
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
              <Typography
                variant="overline"
                component="p"
                sx={(theme) => ({
                  color: theme.palette.custom.semantic.storeMarketing.darkAccent,
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                })}
              >
                Atención comercial
              </Typography>

              <Typography
                variant="h2"
                sx={(theme) => ({
                  mt: 1,
                  color: theme.palette.custom.semantic.storeMarketing.darkText,
                })}
              >
                ¿Necesitas precios por volumen o empaques personalizados?
              </Typography>

              <Typography
                variant="body1"
                sx={(theme) => ({
                  mt: 1.5,
                  color: theme.palette.custom.semantic.storeMarketing.darkMuted,
                  lineHeight: 1.75,
                })}
              >
                Te ayudamos a elegir medidas, cantidades, materiales y alternativas de
                abastecimiento según tu negocio.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1.5}>
                <Button
                  component={RouterLink}
                  to="/contacto?motivo=cotizacion"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                >
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