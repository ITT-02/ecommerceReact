import {
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Pagination,
  Stack,
  Box,
} from '@mui/material';
import { useState } from 'react';

export const NavigationSection = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Navegación
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Tabs, breadcrumbs y paginación.
        </Typography>

        <Stack spacing={3}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="ejemplo de tabs"
            >
              <Tab label="Activo" />
              <Tab label="Inactivo" />
              <Tab label="Borrador" />
            </Tabs>
          </Box>

          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="#">
              Inicio
            </Link>
            <Link underline="hover" color="inherit" href="#">
              Categoría
            </Link>
            <Typography color="text.primary">Producto</Typography>
          </Breadcrumbs>

          <Pagination count={10} color="primary" />
        </Stack>
      </CardContent>
    </Card>
  );
};