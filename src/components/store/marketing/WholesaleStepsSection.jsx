/**
 * Sección de pasos para el programa mayorista.
 */

import { Box, Container, Typography } from '@mui/material';

import { StoreSectionHeader } from './StoreSectionHeader';

const getStepNumber = (index) => String(index + 1).padStart(2, '0');

const StepItem = ({ index, title, description, isLast }) => (
  <Box
    sx={(theme) => {
      const m = theme.palette.custom.semantic.storeMarketing;

      return {
        position: 'relative',
        px: { xs: 0, md: 2 },
        textAlign: 'center',
        '&::after': {
          content: isLast ? 'none' : '""',
          position: 'absolute',
          top: 28,
          left: 'calc(50% + 42px)',
          width: 'calc(100% - 84px)',
          borderTop: `1px solid ${m.lightDivider}`,
          display: { xs: 'none', md: 'block' },
        },
      };
    }}
  >
    {/* Indicador numérico del paso */}
    <Box
      sx={(theme) => {
        const m = theme.palette.custom.semantic.storeMarketing;

        return {
          position: 'relative',
          zIndex: 1,
          width: 58,
          height: 58,
          mx: 'auto',
          mb: 2,
          borderRadius: theme.palette.custom.radius.xs,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: m.darkBgAlt,
          border: `1px solid ${m.darkAccent}`,
          boxShadow: theme.palette.custom.shadows.sm,
        };
      }}
    >
      <Typography
        component="span"
        sx={(theme) => ({
          display: 'block',
          color: theme.palette.custom.semantic.storeMarketing.darkAccent,
          fontSize: '1.1rem',
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '0.06em',
          textAlign: 'center',
        })}
      >
        {getStepNumber(index)}
      </Typography>
    </Box>

    <Typography
      variant="h5"
      component="h3"
      sx={(theme) => ({
        mb: 1,
        lineHeight: 1.25,
        color: theme.palette.custom.semantic.storeMarketing.lightText,
      })}
    >
      {title}
    </Typography>

    <Typography
      variant="body2"
      sx={(theme) => ({
        maxWidth: 340,
        mx: 'auto',
        color: theme.palette.custom.semantic.storeMarketing.lightMuted,
        lineHeight: 1.75,
      })}
    >
      {description}
    </Typography>
  </Box>
);

export const WholesaleStepsSection = ({ steps = [] }) => {
  if (!steps.length) return null;

  return (
    <Box
      component="section"
      sx={(theme) => {
        const m = theme.palette.custom.semantic.storeMarketing;

        return {
          bgcolor: m.lightBgAlt,
          py: { xs: 7, md: 9 },
          borderTop: `1px solid ${m.lightBorder}`,
          borderBottom: `1px solid ${m.lightBorder}`,
        };
      }}
    >
      <Container maxWidth="lg">
        <StoreSectionHeader
          eyebrow="Cómo funciona"
          title="Tres pasos para empezar"
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            gap: { xs: 4.5, md: 3 },
            alignItems: 'start',
          }}
        >
          {steps.map((step, index) => (
            <StepItem
              key={`${step.title}-${index}`}
              index={index}
              title={step.title}
              description={step.description}
              isLast={index === steps.length - 1}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};