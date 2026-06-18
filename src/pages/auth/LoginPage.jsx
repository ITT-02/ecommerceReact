/**
 * Página de inicio de sesión.
 * Valida email y contraseña antes de enviar a la API.
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
import { alpha } from '@mui/material/styles';
const getLoginPalette = (theme) => {
  const colors = theme.palette.custom.colors;
  const isDark = theme.palette.mode === 'dark';

  return {
    title: isDark ? colors.metal.silver100 : colors.emerald[900],
    muted: isDark
      ? alpha(colors.warm.ivory, 0.68)
      : alpha(colors.emerald[900], 0.68),

    link: isDark ? alpha(colors.warm.ivory, 0.78) : colors.emerald[900],
    linkHover: isDark ? colors.gold[550] : colors.gold[700],

    buttonBg: colors.emerald[900],
    buttonHover: isDark ? colors.emerald[800] : colors.emerald[950],
    buttonText: colors.warm.ivory,
    buttonBorder: isDark ? colors.gold[650] : colors.gold[700],

    checkbox: isDark ? colors.gold[550] : colors.gold[700],
  };
};

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
    <AuthPageShell maxWidth={420}>
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
    <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={(theme) => ({
            fontWeight: 850,
            letterSpacing: '-0.04em',
            color: getLoginPalette(theme).title,
          })}
        >
          Iniciar sesión
        </Typography>
    </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2.1}>
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
          control={
            <Checkbox
              size="small"
              disabled={loading}
              sx={(theme) => {
                const p = getLoginPalette(theme);

                return {
                  color: p.muted,
                  '&.Mui-checked': {
                    color: p.checkbox,
                  },
                };
              }}
            />
          }
          label={
            <Typography
              sx={(theme) => ({
                fontSize: 13,
                color: getLoginPalette(theme).muted,
              })}
            >
              Recordarme
            </Typography>
          }
        />

          <Link
            component={RouterLink}
            to="/forgot-password"
            underline="none"
            sx={(theme) => {
              const p = getLoginPalette(theme);

              return {
                fontSize: 13,
                fontWeight: 800,
                color: p.link,
                transition: theme.transitions.create(['color'], {
                  duration: theme.transitions.duration.short,
                }),
                '&:hover': {
                  color: p.linkHover,
                },
              };
            }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            disableElevation
            sx={(theme) => {
              const p = getLoginPalette(theme);

              return {
                minHeight: 50,
                borderRadius: theme.palette.custom.radius.xs,
                bgcolor: p.buttonBg,
                color: p.buttonText,
                fontWeight: 850,
                textTransform: 'none',
                border: `1px solid ${alpha(p.buttonBorder, 0.38)}`,
                boxShadow: `0 18px 34px ${alpha(theme.palette.custom.colors.emerald[950], 0.28)}`,
                '&:hover': {
                  bgcolor: p.buttonHover,
                  boxShadow: `0 20px 38px ${alpha(theme.palette.custom.colors.emerald[950], 0.34)}`,
                },
                '&.Mui-disabled': {
                  bgcolor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                  boxShadow: 'none',
                },
              };
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>

        <Typography
          variant="body2"
          align="center"
          sx={(theme) => ({
            color: getLoginPalette(theme).muted,
          })}
        >
          ¿Eres cliente nuevo?{' '}
          <Link
            component={RouterLink}
            to="/registro"
            underline="none"
            sx={(theme) => {
              const p = getLoginPalette(theme);

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
            Crear cuenta
          </Link>
        </Typography>
        </Stack>
      </Box>
    </AuthPageShell>
  );
};