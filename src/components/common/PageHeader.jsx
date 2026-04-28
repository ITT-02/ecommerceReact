// Encabezado reutilizable para páginas.

import { Box, Typography } from '@mui/material';

export const PageHeader = ({ title, description, action }) => {
  return (
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{title}</Typography>
        {description && <Typography variant="body2" color="text.secondary">{description}</Typography>}
      </Box>
      {action}
    </Box>
  );
};
