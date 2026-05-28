/**
 * Timeline público en MUI v9.
 * Sección: Cronología / Nuestro camino.
 * Usa un fondo perla y acentos malva para refrescar la vista sin bloques grises pesados.
 */

import { Box, Card, CardContent, Container, Typography } from '@mui/material';

import { StoreSectionHeader } from './StoreSectionHeader';

const getMarketingTheme = (theme) => theme.palette.custom.semantic.storeMarketing;

const TimelineCard = ({ item, align = 'left' }) => {
  const isLeft = align === 'left';

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: {
          xs: 'flex-start',
          md: isLeft ? 'flex-start' : 'flex-end',
        },
        pl: { xs: 4, md: 0 },
      }}
    >
      {/* Punto del timeline */}
      <Box
        sx={(theme) => {
          const m = getMarketingTheme(theme);

          return {
            position: 'absolute',
            top: { xs: 22, md: 28 },
            left: { xs: 8, md: '50%' },
            transform: { xs: 'none', md: 'translateX(-50%)' },
            zIndex: 2,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            bgcolor: m.timelineBg,
            border: '2px solid',
            borderColor: m.mauveAccent,
          };
        }}
      />

      {/* Línea corta entre el punto y la tarjeta */}
      <Box
        sx={(theme) => {
          const m = getMarketingTheme(theme);

          return {
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            top: 32,
            left: isLeft ? 'calc(50% - 34px)' : '50%',
            width: '34px',
            height: '1px',
            bgcolor: m.timelineLine,
          };
        }}
      />

      <Box
        sx={{
          width: { xs: '100%', md: 'calc(50% - 34px)' },
          maxWidth: 350,
          mr: { xs: 0, md: isLeft ? 'auto' : 0 },
          ml: { xs: 0, md: isLeft ? 0 : 'auto' },
        }}
      >
        <Card
          sx={(theme) => {
            const m = getMarketingTheme(theme);

            return {
              borderRadius: theme.palette.custom.radius.xs,
              backgroundImage: 'none',
              bgcolor: m.lightCardBg,
              border: `1px solid ${m.lightCardBorder}`,
              boxShadow: theme.palette.custom.shadows.sm,
              transition: `transform ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}, box-shadow ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}, border-color ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: m.mauveAccent,
                boxShadow: theme.palette.custom.shadows.md,
              },
            };
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 2.25, md: 2.4 },
              '&:last-child': { pb: { xs: 2, sm: 2.25, md: 2.4 } },
            }}
          >
            <Typography
              variant="overline"
              component="p"
              sx={(theme) => {
                const m = getMarketingTheme(theme);

                return {
                  mb: 0.5,
                  color: m.mauveAccent,
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  lineHeight: 1.2,
                };
              }}
            >
              {item.year}
            </Typography>

            <Typography
              variant="h6"
              component="h3"
              sx={(theme) => {
                const m = getMarketingTheme(theme);

                return {
                  mt: 0.25,
                  mb: 1,
                  color: m.lightText,
                  fontSize: { xs: '0.92rem', sm: '0.98rem', md: '1.02rem' },
                  lineHeight: 1.35,
                  textTransform: 'uppercase',
                };
              }}
            >
              {item.title}
            </Typography>

            <Typography
              variant="body2"
              sx={(theme) => {
                const m = getMarketingTheme(theme);

                return {
                  color: m.lightMuted,
                  fontSize: '0.83rem',
                  lineHeight: 1.7,
                };
              }}
            >
              {item.description}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export const TimelineSection = ({ eyebrow = 'Cronología', title = 'Nuestro camino', items = [] }) => {
  if (!items.length) return null;

  return (
    <Box
      component="section"
      sx={(theme) => {
        const m = getMarketingTheme(theme);

        return {
          bgcolor: m.timelineBg,
          py: { xs: 5.5, md: 7 },
          borderBottom: `1px solid ${m.mauveBorder}`,
        };
      }}
    >
      <Container maxWidth="lg">
        <StoreSectionHeader eyebrow={eyebrow} title={title} accent="mauve" />

        {/* Contenedor del timeline. La línea vertical usa width: '1px' para evitar bloques grises. */}
        <Box
          sx={(theme) => {
            const m = getMarketingTheme(theme);

            return {
              position: 'relative',
              width: '100%',
              maxWidth: 840,
              mx: 'auto',
              mt: { xs: 3, md: 4 },

              '&::before': {
                content: '""',
                position: 'absolute',
                top: { xs: 22, md: 28 },
                bottom: 0,
                left: { xs: 13, md: '50%' },
                width: '1px',
                transform: { xs: 'none', md: 'translateX(-50%)' },
                bgcolor: m.timelineLine,
              },
            };
          }}
        >
          <Box sx={{ display: 'grid', gap: { xs: 2.5, md: 3.1 } }}>
            {items.map((item, index) => (
              <TimelineCard
                key={`${item.year}-${item.title}`}
                item={item}
                align={index % 2 === 0 ? 'left' : 'right'}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
