import { Box, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const AuthPageShell = ({ title, subtitle, children }) => {
 
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        px: 2,
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 980,
          minHeight: { xs: 'auto', md: 560 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          overflow: 'hidden',
          borderRadius: theme.palette.custom.radius.sm,
          border: 1,
          borderColor: 'divider',
          boxShadow: theme.shadows[5],
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            position: 'relative',
            overflow: 'hidden',
            p: 5,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            alignItems: 'center',

            '&::before': {
              content: '""',
              position: 'absolute',
              width: 260,
              height: 260,
              borderRadius: theme.palette.custom.radius.full,
              bgcolor: theme.palette.custom.semantic.primarySoft,
              top: -80,
              left: -80,
            },

            '&::after': {
              content: '""',
              position: 'absolute',
              width: 180,
              height: 180,
              borderRadius: theme.palette.custom.radius.full,
              bgcolor: theme.palette.custom.semantic.primarySofter,
              bottom: -60,
              right: -40,
            },
          }}
        >
          <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              Aliqora
            </Typography>

            <Typography variant="h6">
              Gestión y tienda online para empaques
            </Typography>

            <Typography variant="body1">
              Administra productos, inventario, pedidos y pagos desde una
              plataforma moderna.
            </Typography>
          </Stack>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 3, sm: 5 },
            py: { xs: 4, sm: 6 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {title}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Box>

            {children}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};