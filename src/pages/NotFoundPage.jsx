// Página 404.

import { Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h3" sx={{ fontWeight: 700 }}>404</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Página no encontrada.</Typography>
      <Button component={Link} to="/" variant="contained">Volver al inicio</Button>
    </Container>
  );
};
