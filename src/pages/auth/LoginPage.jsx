// Página de inicio de sesión.
// Envía email y password a la API externa y redirige según el rol.

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/auth/useAuth';
import { getDefaultPathByRoles } from '../../utils/access/menuByRole';

import { AuthPageShell } from './components/AuthPageShell';

export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);

  const { login, loading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const result = await login(formData);

      const roles = result.roles || result.context?.roles || [];
      const defaultPath = getDefaultPathByRoles(roles);

      const fromPath = location.state?.from?.pathname;

      const redirectTo = fromPath?.startsWith('/admin')
        ? fromPath
        : defaultPath;

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}

          <AuthPageShell
            title="Iniciar sesión"
            subtitle="Ingresa con tu usuario registrado."
          >
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Stack spacing={2}>
                <TextField
                  name="email"
                  label="Correo electrónico"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <TextField
                  name="password"
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                >
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary">
              ¿Eres cliente nuevo?{' '}
              <Link component={RouterLink} to="/registro" underline="hover">
                Crear cuenta
              </Link>
            </Typography>
          </AuthPageShell>
        </Stack>
      </CardContent>
    </Card>
  );
};