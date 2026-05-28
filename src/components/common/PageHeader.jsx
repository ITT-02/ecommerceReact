// Encabezado reutilizable para páginas administrativas y públicas.

import { Box, Typography } from '@mui/material';

export const PageHeader = ({ title, description, action }) => {
  return (
    <Box
      sx={(theme) => ({
        
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        flexDirection: { xs: 'column', md: 'row' },
       
        borderBottom: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 500,
            textTransform: 'none',
          }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.75, maxWidth: 720 }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
};
