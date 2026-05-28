/**
 * Footer público de la tienda.
 */

import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const footerLinks = [
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Mayoristas', to: '/mayoristas' },
  { label: 'Nuestra Historia', to: '/nuestra-historia' },
  { label: 'Contacto', to: '/contacto' },
  { label: 'Mis pedidos', to: '/mis-pedidos' },
];

export const StoreFooter = () => {
  return (
    <Box
      component="footer"
      sx={(theme) => {
        const nav = theme.palette.custom.semantic.storeNavigation;

        return {
          mt: 6,
          py: 5,
          bgcolor: nav.bg,
          color: nav.text,
          borderTop: `1px solid ${nav.border}`,
        };
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h4" sx={(theme) => ({ color: theme.palette.custom.semantic.storeNavigation.brandText, letterSpacing: '0.16em' })}>
              Aliqora
            </Typography>
            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.custom.semantic.storeNavigation.textMuted, maxWidth: 420 })}>
              Empaques para venta online, atención personalizada, pagos, seguimiento y despacho con transportistas externos.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: { md: 'flex-end' }, flexWrap: 'wrap' }}>
              {footerLinks.map((link) => (
                <Typography
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  variant="body2"
                  sx={(theme) => ({
                    color: theme.palette.custom.semantic.storeNavigation.textMuted,
                    textDecoration: 'none',
                    '&:hover': { color: theme.palette.custom.semantic.storeNavigation.brandText },
                  })}
                >
                  {link.label}
                </Typography>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Box sx={(theme) => ({ mt: 4, pt: 2, borderTop: `1px solid ${theme.palette.custom.semantic.storeNavigation.divider}` })}>
          <Typography variant="caption" sx={(theme) => ({ color: theme.palette.custom.semantic.storeNavigation.textSubtle, letterSpacing: '0.12em' })}>
            © {new Date().getFullYear()} Aliqora Empaques. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
