/**
 * Encabezado reutilizable para secciones públicas.
 * Usa storeMarketing para mantener una combinación elegante:
 * texto profundo, acentos arena/malva y fondos sin saturación.
 */

import { Box, Typography } from '@mui/material';

const getAccentColor = (theme, tone, accent) => {
  const m = theme.palette.custom.semantic.storeMarketing;

  if (tone === 'dark') return m.darkAccent;
  if (accent === 'mauve') return m.mauveAccent;
  if (accent === 'sage') return m.freshAccent;
  if (accent === 'wine') return m.wineAccent;
  return m.lightAccent;
};

export const StoreSectionHeader = ({
  eyebrow,
  title,
  description,
  align = 'center',
  maxWidth = 760,
  tone = 'light',
  accent = 'gold',
}) => {
  const isDark = tone === 'dark';

  return (
    <Box
      sx={{
        mx: align === 'center' ? 'auto' : 0,
        mb: { xs: 3.25, md: 4.5 },
        maxWidth,
        textAlign: align,
      }}
    >
      {eyebrow && (
        <Typography
          variant="overline"
          component="p"
          sx={(theme) => {
            const m = theme.palette.custom.semantic.storeMarketing;

            return {
              mb: 1.15,
              display: 'block',
              color: getAccentColor(theme, tone, accent),
              fontWeight: 800,
              letterSpacing: '0.22em',
              lineHeight: 1.4,
            };
          }}
        >
          {eyebrow}
        </Typography>
      )}

      <Typography
        variant="h2"
        component="h2"
        sx={(theme) => {
          const m = theme.palette.custom.semantic.storeMarketing;

          return {
            color: isDark ? m.darkText : m.lightText,
            fontSize: { xs: '1.6rem', sm: '1.92rem', md: '2.22rem' },
            lineHeight: 1.15,
            maxWidth: align === 'center' ? maxWidth : 'none',
          };
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body1"
          sx={(theme) => {
            const m = theme.palette.custom.semantic.storeMarketing;

            return {
              mt: 1.6,
              color: isDark ? m.darkMuted : m.lightMuted,
              maxWidth: 720,
              mx: align === 'center' ? 'auto' : 0,
              lineHeight: 1.75,
            };
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
};
