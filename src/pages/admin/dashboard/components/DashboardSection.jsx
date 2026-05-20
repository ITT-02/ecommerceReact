import { Box, Card, CardContent, Typography } from '@mui/material';

export const DashboardSection = ({ title, children }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
};

