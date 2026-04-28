// Página para accesos bloqueados por rol.

import { Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const NotAuthorizedPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>No autorizado</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Tu rol no tiene permiso para ingresar a esta sección.</Typography>
      <Button component={Link} to="/" variant="contained">Volver</Button>
    </Container>
  );
};
