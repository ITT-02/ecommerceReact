/**
 * Página pública Nuestra Historia.
 *
 * Estructura visual:
 * 1. Hero principal: fondo oscuro de marca.
 * 2. Quiénes somos: fondo oscuro, porque queremos invertir el orden visual.
 * 3. Nuestro camino: se renderiza desde TimelineSection con fondo claro.
 * 4. Valores: fondo oscuro.
 * 5. Equipo: se mantiene en su propio componente.
 */

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { StoreFeatureCard } from '../../components/store/marketing/StoreFeatureCard';
import { StoreSectionHeader } from '../../components/store/marketing/StoreSectionHeader';
import { TeamSection } from '../../components/store/marketing/TeamSection';
import { TimelineSection } from '../../components/store/marketing/TimelineSection';
import { storyPageContent } from '../../data/storePageContent';

import nuestrahistoria from '../../../src/assets/nuestrahistoria/anny-aliquora.png';

export const StoryPage = () => {
  const { hero, intro, timeline, values, team } = storyPageContent;

  return (
    <Box sx={(theme) => ({ bgcolor: theme.palette.custom.semantic.storeMarketing.lightBg })}>
      {/* =========================================================
          HERO PRINCIPAL
      ========================================================= */}
      <Box
        component="section"
        sx={(theme) => {
          const m = theme.palette.custom.semantic.storeMarketing;

          return {
            py: { xs: 7, md: 10 },
            bgcolor: m.lightBg,
            color: m.lightText,
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
                  {hero.eyebrow}
                </Typography>

                <Typography
                  variant="h1"
                  sx={(theme) => ({
                    color: theme.palette.custom.semantic.storeMarketing.lightText,
                    fontSize: { xs: '2rem', sm: '2.45rem', md: '3rem' },
                    lineHeight: 1.1,
                  })}
                >
                  {hero.title}
                </Typography>

                <Typography
                  variant="body1"
                  sx={(theme) => ({
                    color: theme.palette.custom.semantic.storeMarketing.lightMuted,
                    maxWidth: 680,
                    lineHeight: 1.75,
                  })}
                >
                  {hero.description}
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                  <Button component={RouterLink} to={hero.primaryAction.to} variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>
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
                        '&:hover': {
                          borderColor: m.mauveAccent,
                          bgcolor: m.mauveBg,
                        },
                      };
                    }}
                  >
                    {hero.secondaryAction.label}
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                component="img"
                src={nuestrahistoria}
                alt="Nuestra Historia"
                sx={{
                  width: '100%',
                  maxWidth: 380,
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                  borderRadius: 3,
                  boxShadow: 2,
                }}
              />
            </Grid>
          </Grid>
        </Container>    
      </Box>

      {/* =========================================================
          QUIÉNES SOMOS
      ========================================================= */}
      <Box
        component="section"
        sx={(theme) => {
          const m = theme.palette.custom.semantic.storeMarketing;

          return {
            bgcolor: m.freshBg,
            py: { xs: 7, md: 9 },
            borderBottom: `1px solid ${m.freshBorder}`,
          };
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <StoreSectionHeader
                eyebrow={intro.eyebrow}
                title={intro.title}
                align="left"
                maxWidth={820}
                accent="sage"
              />

              <Stack spacing={2} sx={{ maxWidth: 820 }}>
                {intro.paragraphs.map((paragraph) => (
                  <Typography key={paragraph} variant="body1" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.lightMuted, lineHeight: 1.8 })}>
                    {paragraph}
                  </Typography>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)', md: '1fr' }, gap: 1.5 }}>
                {intro.stats.map((stat, index) => (
                  <Box
                    key={stat.label}
                    sx={(theme) => {
                      const m = theme.palette.custom.semantic.storeMarketing;

                      return {
                        p: 2.25,
                        borderRadius: theme.palette.custom.radius.xs,
                        bgcolor: m.lightCardBg,
                        border: `1px solid ${index === 1 ? m.mauveBorder : m.freshBorder}`,
                        boxShadow: theme.palette.custom.shadows.sm,
                      };
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={(theme) => ({
                        color: index === 1
                          ? theme.palette.custom.semantic.storeMarketing.mauveAccent
                          : theme.palette.custom.semantic.storeMarketing.freshAccent,
                        fontSize: { xs: '1.45rem', md: '1.8rem' },
                      })}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.custom.semantic.storeMarketing.lightMuted })}>
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* =========================================================
          NUESTRO CAMINO / CRONOLOGÍA
      ========================================================= */}
      <TimelineSection items={timeline} />

      {/* =========================================================
          VALORES
      ========================================================= */}
      <Box
        component="section"
        sx={(theme) => ({
          bgcolor: theme.palette.custom.semantic.storeMarketing.darkBg,
          py: { xs: 7, md: 9 },
          borderTop: `1px solid ${theme.palette.custom.semantic.storeMarketing.darkBorder}`,
          borderBottom: `1px solid ${theme.palette.custom.semantic.storeMarketing.darkBorder}`,
        })}
      >
        <Container maxWidth="xl">
          <StoreSectionHeader eyebrow="Nuestros valores" title="Lo que nos guía" tone="dark" />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 3 }}>
            {values.map((value) => (
              <StoreFeatureCard key={value.title} iconKey={value.iconKey} title={value.title} description={value.description} tone="dark" />
            ))}
          </Box>
        </Container>
      </Box>

      {/* =========================================================
          EQUIPO
      ========================================================= */}
      <TeamSection members={team} />
    </Box>
  );
};
