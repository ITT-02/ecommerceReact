// Página pública de registro para clientes normales.
// Este formulario NO crea administradores; el rol administrativo se gestiona desde el panel privado.

import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { Alert, Avatar, Box, Button, Card, CardContent, Link, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { initialRegisterFormData, validateRegisterForm } from '../../adapters/auth/authAdapter';
import { useAuth } from '../../hooks/auth/useAuth';

export const RegisterPage = () => {
  const [formData, setFormData] = useState(initialRegisterFormData);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validationMessage = validateRegisterForm(formData);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      await register(formData);
      setSuccess('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
      setFormData(initialRegisterFormData);

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <PersonAddAltIcon />
          </Avatar>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4">Crear cuenta</Typography>
            <Typography variant="body2" color="text.secondary">
              Regístrate como cliente para comprar, guardar direcciones y revisar tus pedidos.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ width: '100%' }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Stack spacing={2}>
              <TextField name="nombres" label="Nombres" value={formData.nombres} onChange={handleChange} required />
              <TextField name="apellidos" label="Apellidos" value={formData.apellidos} onChange={handleChange} required />
              <TextField name="telefono" label="Teléfono opcional" value={formData.telefono} onChange={handleChange} />
              <TextField name="email" label="Correo electrónico" type="email" value={formData.email} onChange={handleChange} required />
              <TextField name="password" label="Contraseña" type="password" value={formData.password} onChange={handleChange} required />
              <TextField name="confirmPassword" label="Confirmar contraseña" type="password" value={formData.confirmPassword} onChange={handleChange} required />

              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary">
            ¿Ya tienes cuenta?{' '}
            <Link component={RouterLink} to="/login" underline="hover">
              Inicia sesión
            </Link>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
