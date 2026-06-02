import { Paper, Grid } from '@mui/material';

import { OrderInfoLine } from './OrderInfoLine';

export const OrderSummaryPanel = ({ items = [], defaultSize = { xs: 12, sm: 6, md: 3 }, sx }) => {
  if (!items.length) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2.5,
        bgcolor: 'background.paper',
        ...sx,
      }}
    >
      <Grid container spacing={1.5}>
        {items.map((item) => (
          <Grid key={item.key || item.label} size={item.size || defaultSize}>
            <OrderInfoLine label={item.label} value={item.value} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
