// Chip de estado reutilizable. El color visual final se controla desde el theme.

import { Chip } from '@mui/material';

const statusColorMap = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  danger: 'error',
  info: 'info',
  primary: 'primary',
  secondary: 'secondary',
  default: 'default',
};

export const StatusChip = ({ label, color = 'default', variant = 'outlined', ...props }) => {
  return (
    <Chip
      label={label}
      color={statusColorMap[color] ?? 'default'}
      size="small"
      variant={variant}
      {...props}
    />
  );
};
