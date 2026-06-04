/**
 * Página de inicio de sesión.
 * Valida email y contraseña antes de enviar a la API  y redirige según el rol..
 */

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Typography,
} from '@mui/material';

import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import {
  initialLoginFormData,
  loginFormToAuthPayload,
  validateLoginForm,
} from '../../adapters/auth/authAdapter';
import { useAuth } from '../../hooks/auth/useAuth';
import { getDefaultPathByRoles } from '../../utils/access/menuByRole';
import { hasFieldErrors } from '../../utils/validators';

import { AuthFormTextField } from './components/AuthFormTextField';
import { AuthPageShell } from './components/AuthPageShell';

export const LoginPage = () => {
  const [formData, setFormData] = useState(initialLoginFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: '',
    }));

    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const validationErrors = validateLoginForm(formData);

    if (hasFieldErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      setError('Revisa los campos marcados antes de ingresar.');
      return;
    }

    try {
      const result = await login(loginFormToAuthPayload(formData));

      const roles = result.roles || result.context?.roles || [];
      const defaultPath = getDefaultPathByRoles(roles);
      const fromPath = location.state?.from?.pathname;

      const redirectTo = fromPath?.startsWith('/admin') ? fromPath : defaultPath;

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || 'No se pudo iniciar sesión.');
    }
  };

  return (
    <AuthPageShell
      sideDescription="Accede a tu cuenta para revisar pedidos, cotizaciones, pagos y seguimiento de envíos."
      maxWidth={420}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Iniciar sesión
          </Typography>

          <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>
            Ingresa con tu correo registrado.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Stack spacing={2.25}>
          <AuthFormTextField
            name="email"
            label="Correo electrónico"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            icon={EmailOutlinedIcon}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            disabled={loading}
          />

          <AuthFormTextField
            name="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            icon={LockOutlinedIcon}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password}
            disabled={loading}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />

          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <FormControlLabel
              control={<Checkbox size="small" disabled={loading} />}
              label={<Typography sx={{ fontSize: 13 }}>Recordarme</Typography>}
            />

            <Link
              component={RouterLink}
              to="/forgot-password"
              underline="hover"
              sx={{ fontSize: 13, fontWeight: 700 }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>

          <Typography variant="body2" color="text.secondary" align="center">
            ¿Eres cliente nuevo?{' '}
            <Link component={RouterLink} to="/registro" underline="hover" sx={{ fontWeight: 700 }}>
              Crear cuenta
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthPageShell>
  );
};