import { isValidElement } from 'react';
import { Box, Stack, Typography } from '@mui/material';

export const OrderInfoLine = ({ label, value, valueSx }) => (
  <Stack spacing={0.35} sx={{ minWidth: 0 }}>
    <Typography
      variant="caption"
      color="text.secondary"
      fontWeight={800}
      sx={{ textTransform: 'uppercase', letterSpacing: 0.25 }}
    >
      {label}
    </Typography>

    {isValidElement(value) ? (
      <Box sx={{ minWidth: 0 }}>{value}</Box>
    ) : (
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{
          color: value ? 'text.primary' : 'text.disabled',
          wordBreak: 'break-word',
          ...valueSx,
        }}
      >
        {value || '-'}
      </Typography>
    )}
  </Stack>
);
