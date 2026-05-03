import { Alert, Box, Button, Divider, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';

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

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: (theme) => theme.palette.action.hover, 
      borderRadius: (theme) => theme.custom?.radius?.md || 12, 
      '& fieldset': { border: 'none' },
      '&:hover fieldset': { 
        border: '1px solid', 
        borderColor: (theme) => theme.palette.divider 
      },
      '&.Mui-focused fieldset': { 
        border: '1px solid', 
        borderColor: (theme) => theme.palette.primary.main 
      },
      '&.Mui-focused': { boxShadow: (theme) => `0 0 0 4px ${theme.palette.action.focus || 'transparent'}` },
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.paper' }}>
      
      {/* IZQUIERDA: imagen */}
      <Box 
        sx={{ 
          flex: 1, 
          display: { xs: 'none', md: 'flex' }, 
          bgcolor: 'background.default', 
          m: 2, 
          borderRadius: 4, 
          overflow: 'hidden', 
          border: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <img 
          src="packages.png"
          alt="Banner de registro" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />

      </Box>

      {/* DERECHA: formulario */}
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          px: { xs: 4, sm: 8, md: 10 }, 
          position: 'relative'
        }}
      >
        <Box sx={{ position: 'absolute', top: 32, right: { xs: 32, sm: 64, md: 80 }, display: { xs: 'none', md: 'block' } }}>
          <Typography variant="body2" color="text.secondary">
            ¿Ya tienes cuenta?{' '}
            <Link component={RouterLink} to="/login" color="primary.main" fontWeight={700} underline="none">
              Inicia sesión
            </Link>
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 450, width: '100%', m: 'auto', py: 4 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Crear cuenta
          </Typography>
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              ¿Ya tienes cuenta?{' '}
              <Link component={RouterLink} to="/login" color="primary.main" fontWeight={700} underline="none">
                Inicia sesión
              </Link>
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Regístrate con tus datos o con tu email
          </Typography>

          {/* Formulario Principal */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={2}>
                <TextField 
                  fullWidth placeholder="Nombres" name="nombres" 
                  value={formData.nombres} onChange={handleChange} required 
                  sx={inputStyles} 
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlinedIcon sx={{ color: 'text.second ary' }} />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
                <TextField 
                  fullWidth placeholder="Apellidos" name="apellidos" 
                  value={formData.apellidos} onChange={handleChange} required 
                  sx={inputStyles} 
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlinedIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </Stack>
              
              <TextField 
                fullWidth placeholder="Teléfono" name="telefono"
                value={formData.telefono} onChange={handleChange}
                sx={inputStyles}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <TextField 
                fullWidth placeholder="Correo electrónico" name="email" type="email"
                value={formData.email} onChange={handleChange} required
                sx={inputStyles}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <TextField 
                fullWidth placeholder="Contraseña" name="password" type="password"
                value={formData.password} onChange={handleChange} required
                sx={inputStyles}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />
              
              <TextField 
                fullWidth placeholder="Confirmar contraseña" name="confirmPassword" type="password"
                value={formData.confirmPassword} onChange={handleChange} required
                sx={inputStyles}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                fullWidth 
                size="large"
                disabled={loading}
                sx={{ 
                  mt: 2, 
                  py: 1.5, 
                  borderRadius: (theme) => theme.custom?.radius?.md || 12, 
                  fontSize: '1rem', 
                }}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ mt: 4, mb: 4, color: 'text.secondary', typography: 'caption', fontWeight: 600 }}>
            O CONTINÚA CON EMAIL
          </Divider>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          {/* Botones Sociales */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
            <Button 
              variant="outlined" 
              fullWidth 
              startIcon={<GoogleIcon />} 
              sx={{ 
                borderRadius: (theme) => theme.custom?.radius?.sm || 8,
                color: 'text.primary', 
                borderColor: 'divider',
                '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' }
              }}
            >
              Google
            </Button>
          </Stack>

        </Box>
      </Box>
    </Box>
  );
};