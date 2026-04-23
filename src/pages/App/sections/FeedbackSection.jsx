import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Alert,
  Button,
  Snackbar,
  LinearProgress,
  CircularProgress,
  Box,
} from '@mui/material';

export const FeedbackSection = () => {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Feedback
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Alertas, Snackbar y componentes de progreso.
        </Typography>

        <Stack spacing={2}>
          <Alert severity="success">Operación realizada con éxito</Alert>
          <Alert severity="warning">Revisa los datos ingresados</Alert>
          <Alert severity="info">Información importante</Alert>
          <Alert severity="error">Ha ocurrido un error</Alert>

          <Alert variant="filled" severity="success">
            Alerta filled success
          </Alert>

          <Alert variant="outlined" severity="warning">
            Alerta outlined warning
          </Alert>

          <Box>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Mostrar Snackbar
            </Button>

            <Snackbar
              open={open}
              autoHideDuration={3000}
              onClose={() => setOpen(false)}
              message="Guardado correctamente"
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Linear Progress
            </Typography>
            <LinearProgress />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Circular Progress
            </Typography>
            <CircularProgress color="primary" />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};