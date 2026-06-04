/**
 * Layout reutilizable para páginas de autenticación.
 * Mantiene Login y Registro con el mismo diseño sin duplicar estructura.
 */

import InventoryIcon from '@mui/icons-material/Inventory';
import { Box, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const defaultFeatures = [
  'Catálogo de productos',
  'Seguimiento de pedidos',
  'Pagos y facturación',
];

export const AuthPageShell = ({
  children,
  title = 'Aliqora',
  sideTitle = 'Tu plataforma de empaques, en un solo lugar',
  sideDescription = 'Accede a tus productos, pedidos y cuenta desde cualquier dispositivo.',
  features = defaultFeatures,
  maxWidth = 420,
}) => {
  return (
    <Box
      component="section"
      sx={(theme) => ({
        display: 'flex',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
      })}
    >
      <Box
        sx={(theme) => ({
          width: { md: '40%' },
          minWidth: { md: 320 },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          gap: 4,
          p: 6,
          background: `linear-gradient(155deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={(theme) => ({
              width: 42,
              height: 42,
              borderRadius: theme.palette.custom.radius.sm,
              bgcolor: theme.palette.custom.semantic.storeNavigation.brandSurface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <InventoryIcon
              sx={(theme) => ({
                color: theme.palette.custom.semantic.storeNavigation.text,
              })}
            />
          </Box>

          <Typography
            variant="h5"
            sx={(theme) => ({
              fontWeight: 800,
              color: theme.palette.custom.semantic.storeNavigation.text,
            })}
          >
            {title}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={(theme) => ({
              fontWeight: 800,
              lineHeight: 1.15,
              color: theme.palette.custom.semantic.storeNavigation.text,
            })}
          >
            {sideTitle}
          </Typography>

          <Typography
            sx={(theme) => ({
              lineHeight: 1.8,
              color: theme.palette.custom.semantic.storeNavigation.textMuted,
            })}
          >
            {sideDescription}
          </Typography>
        </Box>

        <Stack spacing={1.25}>
          {features.map((feature) => (
            <Box
              key={feature}
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                bgcolor: theme.palette.primary.dark,
                borderRadius: theme.palette.custom.radius.sm,
                px: 1.25,
                py: 1.5,
              })}
            >
              <Box
                sx={(theme) => ({
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: theme.palette.custom.semantic.storeNavigation.text,
                  flexShrink: 0,
                })}
              />

              <Typography
                sx={(theme) => ({
                  fontSize: 13,
                  fontWeight: 600,
                  color: theme.palette.primary.contrastText,
                })}
              >
                {feature}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: { xs: 2.5, sm: 3, md: 5 },
        }}
      >
        <Box
          sx={(theme) => ({
            width: '100%',
            maxWidth,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            py: 3.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
          })}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={(theme) => ({
                width: 30,
                height: 30,
                borderRadius: theme.palette.custom.radius.xs,
                bgcolor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <InventoryIcon sx={{ fontSize: 16, color: 'primary.contrastText' }} />
            </Box>

            <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
              {title}
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: 12,
              color: 'text.secondary',
              textAlign: 'right',
            }}
          >
            ¿Necesitas ayuda?{' '}
            <Link
              component={RouterLink}
              to="/contacto"
              underline="hover"
              sx={{ fontWeight: 700, fontSize: 12 }}
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
            py: { xs: 4, md: 5 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};