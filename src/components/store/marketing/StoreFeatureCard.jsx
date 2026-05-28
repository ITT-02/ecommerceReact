/**
 * Card de beneficio/valor para tienda pública.
 * Combina arena, malva, salvia y teal desde el theme; no usa colores sueltos.
 */

import { Box, Card, CardContent, Typography } from '@mui/material';

import { getStoreMarketingIcon } from './storeMarketingIcons';

const getAccent = (m, accent, isDark) => {
  if (isDark) return {
    fg: m.darkAccent,
    bg: m.darkAccentSoft,
    border: m.darkBorder,
  };

  if (accent === 'mauve') return {
    fg: m.mauveAccent,
    bg: m.mauveBg,
    border: m.mauveBorder,
  };

  if (accent === 'sage') return {
    fg: m.freshAccent,
    bg: m.freshAccentSoft,
    border: m.freshBorder,
  };

  if (accent === 'wine') return {
    fg: m.wineAccent,
    bg: m.mauveBg,
    border: m.mauveBorder,
  };

  return {
    fg: m.lightAccent,
    bg: m.lightAccentSoft,
    border: m.lightCardBorder,
  };
};

export const StoreFeatureCard = ({
  iconKey,
  title,
  description,
  tone = 'light',
  accent = 'gold',
  align = 'center',
}) => {
  const Icon = getStoreMarketingIcon(iconKey);
  const isDark = tone === 'dark';

  return (
    <Card
      sx={(theme) => {
        const m = theme.palette.custom.semantic.storeMarketing;
        const radius = theme.palette.custom.radius;
        const motion = theme.palette.custom.motion;
        const accentColor = getAccent(m, accent, isDark);

        return {
          height: '100%',
          borderRadius: radius.xs,
          backgroundImage: 'none',
          bgcolor: isDark ? m.darkCardBg : m.lightCardBg,
          border: '1px solid',
          borderColor: isDark ? m.darkCardBorder : accentColor.border,
          boxShadow: isDark ? 'none' : theme.palette.custom.shadows.sm,
          transition: `transform ${motion.durationBase} ${motion.easeOut}, border-color ${motion.durationBase} ${motion.easeOut}, background-color ${motion.durationBase} ${motion.easeOut}, box-shadow ${motion.durationBase} ${motion.easeOut}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            bgcolor: isDark ? m.darkCardHoverBg : m.lightCardBg,
            borderColor: accentColor.fg,
            boxShadow: isDark ? 'none' : theme.palette.custom.shadows.md,
          },
        };
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2.4, md: 2.8 },
          textAlign: align,
          '&:last-child': { pb: { xs: 2.4, md: 2.8 } },
        }}
      >
        <Box
          sx={(theme) => {
            const m = theme.palette.custom.semantic.storeMarketing;
            const accentColor = getAccent(m, accent, isDark);

            return {
              width: 46,
              height: 46,
              mx: align === 'center' ? 'auto' : 0,
              mb: 1.85,
              borderRadius: theme.palette.custom.radius.xs,
              display: 'grid',
              placeItems: 'center',
              color: accentColor.fg,
              bgcolor: accentColor.bg,
              border: '1px solid',
              borderColor: accentColor.border,
            };
          }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </Box>

        <Typography
          variant="h5"
          component="h3"
          sx={(theme) => {
            const m = theme.palette.custom.semantic.storeMarketing;

            return {
              mb: 1,
              color: isDark ? m.darkText : m.lightText,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              lineHeight: 1.25,
            };
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={(theme) => {
            const m = theme.palette.custom.semantic.storeMarketing;

            return {
              color: isDark ? m.darkMuted : m.lightMuted,
              lineHeight: 1.72,
            };
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};
