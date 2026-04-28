// Chip de estado reutilizable.

import { Chip } from '@mui/material';

export const StatusChip = ({ label, color = 'default' }) => {
  return <Chip label={label} color={color} size="small" />;
};
