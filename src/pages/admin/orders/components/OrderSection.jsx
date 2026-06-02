import { Box, Paper, Stack, Typography } from '@mui/material';

export const OrderSection = ({ title, description, children, dense = false, sx }) => (
  <Paper
    variant="outlined"
    sx={{
      p: dense ? 1.5 : { xs: 1.5, sm: 2 },
      borderRadius: 2.5,
      bgcolor: 'background.paper',
      height: '100%',
      ...sx,
    }}
  >
    <Stack spacing={description ? 1.25 : 1.5}>
      <Box>
        <Typography variant="subtitle1" fontWeight={900}>
          {title}
        </Typography>

        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>

      {children}
    </Stack>
  </Paper>
);
