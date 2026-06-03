// Componente reutilizable para mensajes permanentes dentro de páginas.
// Útil para dashboards, ventas, inventario, contacto y cualquier módulo admin/tienda.

import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Box, Card, CardContent, Grid, Stack, Typography, alpha } from '@mui/material';

const configByType = {
  success: { paletteKey: 'success', Icon: CheckCircleOutlineRoundedIcon },
  warning: { paletteKey: 'warning', Icon: WarningAmberRoundedIcon },
  error: { paletteKey: 'error', Icon: ErrorOutlineRoundedIcon },
  info: { paletteKey: 'info', Icon: InfoOutlinedIcon },
};

export const SystemMessageCard = ({ type = 'info', title, description, action }) => {
  const config = configByType[type] || configByType.info;
  const Icon = config.Icon;

  return (
    <Card
      elevation={0}
      sx={(theme) => {
        const color = theme.palette[config.paletteKey].main;
        return {
          height: '100%',
          borderRadius: theme.palette.custom.radius.xs,
          border: `1px solid ${alpha(color, 0.18)}`,
          borderLeft: `3px solid ${color}`,
          backgroundImage: 'none',
          bgcolor: alpha(color, theme.palette.mode === 'dark' ? 0.12 : 0.075),
        };
      }}
    >
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Box
            sx={(theme) => ({
              color: theme.palette[config.paletteKey].main,
              display: 'grid',
              placeItems: 'center',
              mt: 0.2,
            })}
          >
            <Icon fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {description}
              </Typography>
            )}
            {action && <Box sx={{ mt: 1 }}>{action}</Box>}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export const SystemMessageGrid = ({ messages = [] }) => {
  if (!messages.length) return null;

  return (
    <Grid container spacing={2}>
      {messages.map((message) => (
        <Grid key={message.key || message.title} size={{ xs: 12, md: 6 }}>
          <SystemMessageCard {...message} />
        </Grid>
      ))}
    </Grid>
  );
};
