/**
 * Layout visual para páginas de autenticación.
 */

import { Box, Link, Typography } from '@mui/material';
import { alpha, keyframes, useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import aliqoraLogo from '../../../assets/brand/aliqora-logo.png';
import aliqoraImportLogo from '../../../assets/brand/aliqora-import-logo.png';

/**
 * El panel izquierdo ocupa 50% del ancho en desktop.
 * con logo en el centro del panel izquierdo.
 */
const logoIntroDesktop = keyframes`
  0% {
    opacity: 0;
    transform: translateX(25vw) scale(1.42);
    filter: blur(10px);
  }

  18% {
    opacity: 1;
    filter: blur(0);
  }

  48% {
    opacity: 1;
    transform: translateX(25vw) scale(1.42);
    filter: blur(0);
  }

  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
  }
`;

/**
 * En móvil no se muestra el panel izquierdo.
 * Esta animación se mantiene por compatibilidad visual si se decide reactivar el panel.
 */
const logoIntroMobile = keyframes`
  0% {
    opacity: 0;
    transform: translateY(28vh) scale(1.28);
    filter: blur(10px);
  }

  22% {
    opacity: 1;
    filter: blur(0);
  }

  52% {
    opacity: 1;
    transform: translateY(28vh) scale(1.28);
    filter: blur(0);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
`;

/**
 * Entrada del lado derecho en desktop.
 */
const rightReveal = keyframes`
  0%, 42% {
    opacity: 0;
    transform: translateX(28px);
    filter: blur(8px);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
    filter: blur(0);
  }
`;

/**
 * Splash inicial en móvil:
 * aparece el círculo con logo al centro y luego desaparece.
 */
const mobileSplashExit = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.82);
    filter: blur(10px);
  }

  18% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
    filter: blur(0);
  }

  62% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
    filter: blur(0);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -58%) scale(0.88);
    filter: blur(8px);
    pointer-events: none;
  }
`;

/**
 * Entrada del formulario en móvil después del splash.
 */
const mobileFormReveal = keyframes`
  0%, 58% {
    opacity: 0;
    transform: translateY(18px);
    filter: blur(8px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
`;

/**
 * Movimiento sutil para las siluetas decorativas.
 */
const floatSoft = keyframes`
  0%, 100% {
    transform: translate3d(0, 0, 0) rotate(var(--rotate, 0deg));
  }

  50% {
    transform: translate3d(8px, -12px, 0) rotate(calc(var(--rotate, 0deg) + 2deg));
  }
`;

/**
 * Pulso suave para detalles dorados pequeños.
 */
const sparklePulse = keyframes`
  0%, 100% {
    opacity: 0.38;
    transform: scale(1);
  }

  50% {
    opacity: 0.9;
    transform: scale(1.18);
  }
`;

/**
 * Paleta local derivada del theme.
 * Centraliza decisiones visuales del login.
 */
const getAuthPalette = (theme) => {
  const colors = theme.palette.custom.colors;
  const isDark = theme.palette.mode === 'dark';

  return {
    isDark,

    emerald: colors.emerald[900],
    emeraldDark: colors.emerald[950],
    emeraldSoft: colors.emerald[800],

    gold: isDark ? colors.gold[550] : colors.gold[700],
    goldSoft: isDark ? colors.gold[650] : colors.gold[300],

    ivory: colors.warm.ivory,
    cream: colors.warm.cream,
    white: colors.warm.white,

    textOnEmerald: colors.warm.ivory,
    mutedOnEmerald: alpha(colors.warm.ivory, 0.72),

    textMain: isDark ? colors.metal.silver100 : colors.emerald[900],
    textMuted: isDark
      ? alpha(colors.warm.ivory, 0.68)
      : alpha(colors.emerald[900], 0.68),

    linkText: isDark ? colors.metal.silver100 : colors.emerald[900],
    linkHover: isDark ? colors.gold[550] : colors.gold[700],

    leftBg: `
      radial-gradient(circle at 52% 48%, ${alpha(colors.emerald[800], 0.56)}, transparent 34%),
      radial-gradient(circle at 16% 16%, ${alpha(colors.gold[700], 0.11)}, transparent 26%),
      radial-gradient(circle at 86% 84%, ${alpha(colors.gold[700], 0.08)}, transparent 28%),
      linear-gradient(145deg, ${colors.emerald[950]}, ${colors.emerald[900]})
    `,

    rightBg: isDark
      ? `
        radial-gradient(circle at 88% 14%, ${alpha(colors.gold[650], 0.13)}, transparent 24%),
        radial-gradient(circle at 14% 86%, ${alpha(colors.emerald[700], 0.22)}, transparent 30%),
        linear-gradient(135deg, ${colors.emerald[950]}, ${colors.carbon[950]})
      `
      : `
        radial-gradient(circle at 88% 14%, ${alpha(colors.gold[300], 0.26)}, transparent 24%),
        radial-gradient(circle at 14% 86%, ${alpha(colors.gold[700], 0.10)}, transparent 28%),
        linear-gradient(135deg, ${colors.warm.ivory}, ${colors.warm.cream})
      `,

    cardBg: isDark
      ? alpha(colors.carbon[925], 0.78)
      : alpha(colors.warm.white, 0.78),

    cardBorder: isDark
      ? alpha(colors.gold[650], 0.28)
      : alpha(colors.gold[700], 0.30),

    cardShadow: isDark
      ? `0 34px 90px ${alpha(colors.carbon[1000], 0.56)}`
      : `0 34px 90px ${alpha(colors.emerald[950], 0.12)}`,

    headerBorder: isDark
      ? alpha(colors.gold[650], 0.22)
      : alpha(colors.gold[700], 0.22),

    radiusSm: theme.palette.custom.radius.sm,
    radiusXs: theme.palette.custom.radius.xs,
  };
};

/**
 * Capa decorativa del panel izquierdo.
 * Solo se muestra en desktop para no saturar móvil.
 */
const DecorationLayer = () => {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <ShoppingBag
        sx={{
          top: { md: '8%' },
          left: { md: '8%' },
          width: 104,
          height: 142,
          '--rotate': '-8deg',
          display: { xs: 'none', md: 'block' },
        }}
      />

      <ProductBox
        sx={{
          top: { md: '13%' },
          right: { md: '16%' },
          width: 150,
          height: 76,
          '--rotate': '-3deg',
          display: { xs: 'none', md: 'block' },
        }}
      />

      <Pouch
        sx={{
          left: { md: '7%' },
          top: { md: '43%' },
          width: 104,
          height: 136,
          '--rotate': '1deg',
          display: { xs: 'none', md: 'block' },
        }}
      />

      <GiftBox
        sx={{
          right: { md: '11%' },
          top: { md: '45%' },
          width: 112,
          height: 112,
          '--rotate': '4deg',
          display: { xs: 'none', md: 'block' },
        }}
      />

      <JewelryBox
        sx={{
          left: { md: '8%' },
          bottom: { md: '9%' },
          width: 132,
          height: 94,
          '--rotate': '-5deg',
          display: { xs: 'none', md: 'block' },
        }}
      />

      <ShoppingBag
        sx={{
          right: { md: '9%' },
          bottom: { md: '9%' },
          width: 112,
          height: 140,
          '--rotate': '5deg',
          display: { xs: 'none', md: 'block' },
        }}
      />

      <Pendant
        sx={{
          top: { md: '24%' },
          right: { md: '33%' },
          width: 86,
          height: 78,
          display: { xs: 'none', md: 'block' },
        }}
      />

      <Sparkle sx={{ top: '18%', left: '33%' }} />
      <Sparkle sx={{ top: '41%', left: '23%' }} />
      <Sparkle sx={{ top: '40%', right: '23%' }} />
      <Sparkle sx={{ bottom: '24%', left: '29%' }} />
      <Sparkle sx={{ bottom: '31%', right: '31%' }} />
    </Box>
  );
};

/**
 * Contenedor base para siluetas decorativas.
 */
const ShapeShell = ({ sx, children }) => {
  return (
    <Box
      sx={[
        (theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'absolute',
            color: p.gold,
            opacity: 0.74,
            animation: `${floatSoft} 8s ease-in-out infinite`,
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          };
        },
        sx,
      ]}
    >
      {children}
    </Box>
  );
};

const ShoppingBag = ({ sx }) => {
  return (
    <ShapeShell sx={sx}>
      <Box
        sx={(theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'absolute',
            inset: 0,
            border: `1px solid ${alpha(p.textOnEmerald, 0.22)}`,
            borderRadius: p.radiusXs,
            background: alpha(p.textOnEmerald, 0.035),
            boxShadow: `inset 0 0 24px ${alpha(p.textOnEmerald, 0.04)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              left: '27%',
              top: 18,
              width: '46%',
              height: 38,
              border: `1px solid ${alpha(p.textOnEmerald, 0.24)}`,
              borderTop: 'none',
              borderRadius: '0 0 999px 999px',
            },
            '&::after': {
              content: '"A"',
              position: 'absolute',
              left: '50%',
              top: '53%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'serif',
              fontSize: 28,
              fontWeight: 700,
              color: alpha(p.gold, 0.76),
            },
          };
        }}
      />
    </ShapeShell>
  );
};

const ProductBox = ({ sx }) => {
  return (
    <ShapeShell sx={sx}>
      <Box
        sx={(theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'absolute',
            inset: 0,
            border: `1px solid ${alpha(p.textOnEmerald, 0.2)}`,
            borderRadius: p.radiusXs,
            background: alpha(p.textOnEmerald, 0.03),
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 10,
              borderTop: `1px solid ${alpha(p.textOnEmerald, 0.18)}`,
              transform: 'skewX(-18deg)',
            },
            '&::after': {
              content: '"A"',
              position: 'absolute',
              left: '50%',
              top: '42%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'serif',
              fontSize: 21,
              fontWeight: 700,
              color: alpha(p.gold, 0.72),
            },
          };
        }}
      />
    </ShapeShell>
  );
};

const Pouch = ({ sx }) => {
  return (
    <ShapeShell sx={sx}>
      <Box
        sx={(theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'absolute',
            inset: 0,
            border: `1px solid ${alpha(p.textOnEmerald, 0.2)}`,
            borderRadius: `${p.radiusSm * 2}px ${p.radiusSm * 2}px ${p.radiusSm}px ${p.radiusSm}px`,
            background: `linear-gradient(180deg, ${alpha(p.textOnEmerald, 0.045)}, ${alpha(p.textOnEmerald, 0.015)})`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 18,
              left: 12,
              right: 12,
              height: 1,
              bgcolor: alpha(p.textOnEmerald, 0.2),
              boxShadow: `0 7px 0 ${alpha(p.textOnEmerald, 0.15)}`,
            },
            '&::after': {
              content: '"A"',
              position: 'absolute',
              left: '50%',
              top: '55%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'serif',
              fontSize: 26,
              fontWeight: 700,
              color: alpha(p.gold, 0.7),
            },
          };
        }}
      />
    </ShapeShell>
  );
};

const GiftBox = ({ sx }) => {
  return (
    <ShapeShell sx={sx}>
      <Box
        sx={(theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'absolute',
            inset: 0,
            border: `1px solid ${alpha(p.textOnEmerald, 0.2)}`,
            borderRadius: p.radiusXs,
            background: alpha(p.textOnEmerald, 0.035),
            '&::before': {
              content: '""',
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 1,
              bgcolor: alpha(p.textOnEmerald, 0.2),
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              left: 0,
              right: 0,
              top: '34%',
              height: 1,
              bgcolor: alpha(p.textOnEmerald, 0.2),
            },
          };
        }}
      />

      <Box
        sx={(theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'absolute',
            top: -16,
            left: '50%',
            width: 42,
            height: 22,
            transform: 'translateX(-50%)',
            border: `1px solid ${alpha(p.textOnEmerald, 0.2)}`,
            borderRadius: '999px 999px 4px 4px',
          };
        }}
      />
    </ShapeShell>
  );
};

const JewelryBox = ({ sx }) => {
  return (
    <ShapeShell sx={sx}>
      <Box
        sx={(theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '66%',
            border: `1px solid ${alpha(p.textOnEmerald, 0.22)}`,
            borderRadius: p.radiusSm,
            background: alpha(p.textOnEmerald, 0.035),
          };
        }}
      />

      <Box
        sx={(theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'absolute',
            left: 8,
            right: 8,
            top: 0,
            height: '48%',
            border: `1px solid ${alpha(p.textOnEmerald, 0.2)}`,
            borderRadius: p.radiusSm,
            transform: 'perspective(180px) rotateX(18deg)',
            transformOrigin: 'bottom',
            background: alpha(p.textOnEmerald, 0.025),
          };
        }}
      />

      <Box
        sx={(theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'absolute',
            left: '50%',
            bottom: 18,
            width: 24,
            height: 24,
            border: `2px solid ${alpha(p.gold, 0.76)}`,
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: '50%',
              top: -10,
              width: 13,
              height: 13,
              border: `1px solid ${alpha(p.gold, 0.76)}`,
              transform: 'translateX(-50%) rotate(45deg)',
            },
          };
        }}
      />
    </ShapeShell>
  );
};

const Pendant = ({ sx }) => {
  return (
    <ShapeShell sx={sx}>
      <Box
        sx={(theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'absolute',
            left: 4,
            right: 4,
            top: 0,
            height: 42,
            borderBottom: `1px solid ${alpha(p.textOnEmerald, 0.22)}`,
            borderRadius: '0 0 999px 999px',
          };
        }}
      />

      <Box
        sx={(theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'absolute',
            left: '50%',
            top: 34,
            width: 20,
            height: 28,
            border: `1px solid ${alpha(p.gold, 0.72)}`,
            borderRadius: '999px',
            transform: 'translateX(-50%) rotate(8deg)',
          };
        }}
      />
    </ShapeShell>
  );
};

const Sparkle = ({ sx }) => {
  return (
    <Box
      sx={[
        (theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'absolute',
            width: 14,
            height: 14,
            color: p.gold,
            opacity: 0.7,
            animation: `${sparklePulse} 2.8s ease-in-out infinite`,
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              clipPath:
                'polygon(50% 0%, 61% 38%, 100% 50%, 61% 62%, 50% 100%, 39% 62%, 0% 50%, 39% 38%)',
              bgcolor: alpha(p.gold, 0.72),
            },
          };
        },
        sx,
      ]}
    />
  );
};

export const AuthPageShell = ({
  children,
  title = 'Aliqora',
  maxWidth = 420,
}) => {
  const theme = useTheme();

  /**
   * Logo del encabezado derecho.
   * En modo claro se usa la versión import/oscura para mejor contraste.
   * En modo oscuro se usa la versión clara/original.
   */
  const headerLogo = theme.palette.mode === 'dark'
    ? aliqoraLogo
    : aliqoraImportLogo;

  return (
    <Box
      component="section"
      sx={(theme) => {
        const p = getAuthPalette(theme);

        return {
          position: 'relative',
          display: 'flex',
          minHeight: '100vh',
          overflow: 'hidden',
          bgcolor: p.isDark ? theme.palette.custom.colors.carbon[950] : p.ivory,
          flexDirection: { xs: 'column', md: 'row' },
        };
      }}
    >
      {/* Splash inicial solo para móvil. */}
      <Box
        aria-hidden="true"
        sx={(theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'fixed',
            left: '50%',
            top: '50%',
            zIndex: 20,
            width: 168,
            height: 168,
            borderRadius: '50%',
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            justifyContent: 'center',
            background: `
              radial-gradient(circle at 50% 42%, ${alpha(p.ivory, 0.18)}, ${alpha(p.textOnEmerald, 0.055)} 58%, ${alpha(p.textOnEmerald, 0.025)})
            `,
            border: `1px solid ${alpha(p.gold, 0.58)}`,
            boxShadow: `
              0 34px 90px ${alpha(theme.palette.common.black, 0.32)},
              inset 0 0 70px ${alpha(p.ivory, 0.08)}
            `,
            animation: `${mobileSplashExit} 1.65s cubic-bezier(.22,1,.36,1) forwards`,
            pointerEvents: 'none',
            '@media (prefers-reduced-motion: reduce)': {
              display: 'none',
            },
          };
        }}
      >
        <Box
          component="img"
          src={aliqoraLogo}
          alt=""
          sx={{
            width: '76%',
            height: '76%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Box>

      {/* Panel visual desktop. En móvil se oculta para dejar solo el formulario. */}
      <Box
        sx={(theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'relative',
            width: { md: '50%' },
            minWidth: { md: 420 },
            minHeight: { md: '100vh' },
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            px: { md: 6 },
            py: { md: 6 },
            bgcolor: p.emeraldDark,
            background: p.leftBg,
            color: p.textOnEmerald,
            flexShrink: 0,
            overflow: 'visible',
            zIndex: 2,
          };
        }}
      >
        <DecorationLayer />

        <Box
          component={RouterLink}
          to="/"
          aria-label="Ir al inicio"
          sx={(theme) => {
            const p = getAuthPalette(theme);

            return {
              position: 'relative',
              zIndex: 3,
              width: { md: 300 },
              height: { md: 300 },
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              cursor: 'pointer',
              background: `
                radial-gradient(circle at 50% 42%, ${alpha(p.ivory, 0.18)}, ${alpha(p.textOnEmerald, 0.045)} 58%, ${alpha(p.textOnEmerald, 0.025)})
              `,
              border: `1px solid ${alpha(p.gold, 0.58)}`,
              boxShadow: `
                0 34px 90px ${alpha(theme.palette.common.black, 0.26)},
                inset 0 0 70px ${alpha(p.ivory, 0.08)}
              `,
              animation: `${logoIntroDesktop} 1.65s cubic-bezier(.22,1,.36,1) both`,
              transition: theme.transitions.create(['box-shadow'], {
                duration: theme.transitions.duration.short,
              }),
              '&:hover': {
                boxShadow: `
                  0 38px 100px ${alpha(theme.palette.common.black, 0.32)},
                  inset 0 0 78px ${alpha(p.ivory, 0.1)}
                `,
              },
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            };
          }}
        >
          <Box
            component="img"
            src={aliqoraLogo}
            alt={title}
            sx={(theme) => ({
              width: '76%',
              height: '76%',
              objectFit: 'contain',
              display: 'block',
              filter: `drop-shadow(0 16px 28px ${alpha(theme.palette.common.black, 0.16)})`,
            })}
          />
        </Box>
      </Box>

      {/* encabezado y formulario */}
      <Box
        sx={(theme) => {
          const p = getAuthPalette(theme);

          return {
            position: 'relative',
            zIndex: 1,
            flex: 1,
            minWidth: 0,
            minHeight: { xs: '100vh', md: 'auto' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: { xs: 2.5, sm: 3, md: 5 },
            background: p.rightBg,
            color: p.textMain,
            animation: {
              xs: `${mobileFormReveal} 1.85s cubic-bezier(.22,1,.36,1) both`,
              md: `${rightReveal} 1.35s cubic-bezier(.22,1,.36,1) both`,
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          };
        }}
      >
        <Box
          sx={(theme) => {
            const p = getAuthPalette(theme);

            return {
              width: '100%',
              maxWidth,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              py: { xs: 2.75, md: 3.5 },
              borderBottom: `1px solid ${p.headerBorder}`,
            };
          }}
        >
          <Box
            component={RouterLink}
            to="/"
            aria-label="Ir al inicio"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              minWidth: 0,
            }}
          >
            <Box
              component="img"
              src={headerLogo}
              alt={title}
              sx={{
                width: { xs: 112, sm: 128 },
                maxHeight: 42,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Box>

          <Typography
            sx={(theme) => {
              const p = getAuthPalette(theme);

              return {
                fontSize: 12,
                color: p.textMuted,
                textAlign: 'right',
                lineHeight: 1.5,
              };
            }}
          >
            ¿Necesitas ayuda?{' '}
            <Link
              component={RouterLink}
              to="/contacto"
              underline="none"
              sx={(theme) => {
                const p = getAuthPalette(theme);

                return {
                  fontWeight: 800,
                  fontSize: 12,
                  color: p.linkText,
                  transition: theme.transitions.create(['color'], {
                    duration: theme.transitions.duration.short,
                  }),
                  '&:hover': {
                    color: p.linkHover,
                  },
                };
              }}
            >
              Contáctanos
            </Link>
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            width: '100%',
            maxWidth,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: { xs: 3.5, md: 5 },
          }}
        >
          <Box
            sx={(theme) => {
              const p = getAuthPalette(theme);

              return {
                width: '100%',
                p: { xs: 2.5, sm: 3.5, md: 4 },
                borderRadius: p.radiusSm,
                bgcolor: p.cardBg,
                border: `1px solid ${p.cardBorder}`,
                boxShadow: `
                  ${p.cardShadow},
                  inset 0 1px 0 ${alpha(theme.palette.common.white, p.isDark ? 0.06 : 0.72)}
                `,
                backdropFilter: 'blur(18px)',
              };
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};