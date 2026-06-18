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
import { alpha } from '@mui/material/styles';

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

const getRegisterPalette = (theme) => {
  const colors = theme.palette.custom.colors;
  const isDark = theme.palette.mode === 'dark';

  return {
    title: isDark ? colors.metal.silver100 : colors.emerald[900],

    muted: isDark
      ? alpha(colors.warm.ivory, 0.68)
      : alpha(colors.emerald[900], 0.68),

    link: isDark
      ? alpha(colors.warm.ivory, 0.78)
      : colors.emerald[900],

    linkHover: isDark ? colors.gold[550] : colors.gold[700],

    buttonBg: colors.emerald[900],
    buttonHover: isDark ? colors.emerald[800] : colors.emerald[950],
    buttonText: colors.warm.ivory,
    buttonBorder: isDark ? colors.gold[650] : colors.gold[700],
  };
};

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
    <AuthPageShell maxWidth={500}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={(theme) => ({
              fontWeight: 850,
              letterSpacing: '-0.04em',
              color: getRegisterPalette(theme).title,
            })}
          >
            Crear cuenta
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
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
            helperText={fieldErrors.telefono}
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
                  disabled={loading}
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
                  disabled={loading}
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

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            disableElevation
            sx={(theme) => {
              const p = getRegisterPalette(theme);

              return {
                minHeight: 50,
                borderRadius: theme.palette.custom.radius.xs,
                bgcolor: p.buttonBg,
                color: p.buttonText,
                fontWeight: 850,
                textTransform: 'none',
                border: `1px solid ${alpha(p.buttonBorder, 0.38)}`,
                boxShadow: `0 18px 34px ${alpha(
                  theme.palette.custom.colors.emerald[950],
                  0.28,
                )}`,
                '&:hover': {
                  bgcolor: p.buttonHover,
                  boxShadow: `0 20px 38px ${alpha(
                    theme.palette.custom.colors.emerald[950],
                    0.34,
                  )}`,
                },
                '&.Mui-disabled': {
                  bgcolor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                  boxShadow: 'none',
                },
              };
            }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>

          <Typography
            variant="body2"
            align="center"
            sx={(theme) => ({
              color: getRegisterPalette(theme).muted,
            })}
          >
            ¿Ya tienes cuenta?{' '}
            <Link
              component={RouterLink}
              to="/login"
              underline="none"
              sx={(theme) => {
                const p = getRegisterPalette(theme);

                return {
                  fontWeight: 800,
                  color: p.linkHover,
                  transition: theme.transitions.create(['color'], {
                    duration: theme.transitions.duration.short,
                  }),
                  '&:hover': {
                    color: p.link,
                  },
                };
              }}
            >
              Inicia sesión
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthPageShell>
  );
};