/**
 * Página de registro de cliente.
 * Usa layout compartido, validaciones reutilizables.
 */

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Typography,
} from '@mui/material';

import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import {
  initialRegisterFormData,
  normalizeRegisterFormData,
  validateRegisterForm,
} from '../../adapters/auth/authAdapter';
import { useAuth } from '../../hooks/auth/useAuth';
import { hasFieldErrors, sanitizePhoneInput } from '../../utils/validators';

import { AuthFormTextField } from './components/AuthFormTextField';
import { AuthPageShell } from './components/AuthPageShell';

export const RegisterPage = () => {
  const [formData, setFormData] = useState(initialRegisterFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    const nextValue = name === 'telefono'
      ? sanitizePhoneInput(value)
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: '',
    }));

    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    const validationErrors = validateRegisterForm(formData);

    if (hasFieldErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      setError('Revisa los campos marcados antes de crear tu cuenta.');
      return;
    }

    try {
      await register(normalizeRegisterFormData(formData));

      setSuccess('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
      setFormData(initialRegisterFormData);
      setFieldErrors({});

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } catch (err) {
      setError(err?.message || 'No se pudo crear la cuenta.');
    }
  };

  return (
    <AuthPageShell
      sideTitle="Crea tu cuenta y gestiona tus pedidos con facilidad"
      sideDescription="Regístrate para solicitar cotizaciones, comprar empaques y revisar el estado de tus envíos."
      maxWidth={460}
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
            Crear cuenta
          </Typography>

          <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>
            Regístrate con tus datos de contacto.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Stack spacing={2.25}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <AuthFormTextField
              name="nombres"
              label="Nombres"
              value={formData.nombres}
              onChange={handleChange}
              required
              icon={PersonOutlinedIcon}
              error={Boolean(fieldErrors.nombres)}
              helperText={fieldErrors.nombres}
              disabled={loading}
            />

            <AuthFormTextField
              name="apellidos"
              label="Apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              required
              icon={PersonOutlinedIcon}
              error={Boolean(fieldErrors.apellidos)}
              helperText={fieldErrors.apellidos}
              disabled={loading}
            />
          </Stack>

          <AuthFormTextField
            name="telefono"
            label="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            icon={PhoneOutlinedIcon}
            error={Boolean(fieldErrors.telefono)}
            helperText={
              fieldErrors.telefono ||
              ''
            }
            disabled={loading}
            slotProps={{
              htmlInput: {
                inputMode: 'tel',
                maxLength: 20,
              },
            }}
          />

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
            helperText={fieldErrors.password || 'Mínimo 8 caracteres.'}
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

          <AuthFormTextField
            name="confirmPassword"
            label="Confirmar contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            icon={LockOutlinedIcon}
            error={Boolean(fieldErrors.confirmPassword)}
            helperText={fieldErrors.confirmPassword}
            disabled={loading}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  edge="end"
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar confirmación de contraseña'
                      : 'Mostrar confirmación de contraseña'
                  }
                >
                  {showConfirmPassword ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>

          <Typography variant="body2" color="text.secondary" align="center">
            ¿Ya tienes cuenta?{' '}
            <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 700 }}>
              Inicia sesión
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthPageShell>
  );
};