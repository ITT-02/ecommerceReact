import { Alert, Box, Button, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import InventoryIcon from '@mui/icons-material/Inventory';

import { initialRegisterFormData, validateRegisterForm } from '../../adapters/auth/authAdapter';
import { useAuth } from '../../hooks/auth/useAuth';
import { colors } from '../../styles/theme';

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
    // Retenido temporalmente si es necesario para otros overrides
  };

  return (
    <Box component="section" sx={{display:'flex', minHeight:'100vh' }}>
      
      {/* Panel Izquierdo (Mismo diseño que el Login) */}
      <Box sx={{
        width: { md: '40%' },
        minWidth: { md: 300 },
        background:(theme)=> `linear-gradient(155deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
        p: 6, gap: 4,
      }}>
          {/* Logo */}
          <Box sx ={{ display: 'flex', alignItems: 'center', gap: 1.5}}>
            <Box sx={{ width: 42,
                        height: 42, borderRadius:2.5,
                        bgcolor: 'rgba(0,0,0,0.12)',
                        display :'flex',alignItems: 'center',justifyContent: 'center',
            }}>
              <InventoryIcon sx={{color : 'white'}}></InventoryIcon>
            </Box>
            <Typography variant='h5' fontWeight={700} sx={{ color: colors.primary[50] }}>
              Aliqora
            </Typography>
          </Box>

          {/* Tagline */}
          <Box sx={{flex:1,display:'flex', flexDirection: 'column',
                    justifyContent:'center', gap: 2
          }}>
            <Typography variant='h4' fontWeight={700} sx={{color :colors.primary[50] }}>
              Tu plataforma de empaques, en un solo lugar
            </Typography>
            <Typography sx={{lineHeight:1.8, color : colors.primary[50] }}>
              Únete a nuestra plataforma y gestiona todo de forma sencilla y eficiente.
            </Typography>
          </Box>
          {/* Feature pills */}
          {['Catalogo de productos',
          'Seguimiento de pedidos',
          'Pagos y facturación'].map(feat => (
          <Box key={feat} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            bgcolor: (theme)=>theme.palette.primary.dark,
            borderRadius: 2, px: 1, py: 1.5,
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '10%',
                       bgcolor: 'white', flexShrink: 0 }} />
            <Typography fontSize={13} sx={{ color: (theme) => theme.palette.primary.contrastText}} fontWeight={500}>
              {feat}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Panel derecho */}
      <Box sx={{
        flex:1, display:'flex', flexDirection:'column',
        alignItems: 'center',
        p:{xs:3, md:'0 40px'},
      }}>
        {/* Barra superior con logo y ayuda */}
        <Box sx={{
          width: '100%', maxWidth: 400,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          py: 3.5, borderBottom: '1px solid', borderColor: 'divider',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: 1.5,
              bgcolor: 'primary.main',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <InventoryIcon sx={{ fontSize: 15, color: 'primary.contrastText' }} />
            </Box>
            <Typography fontWeight={700} fontSize={16}>Aliqora</Typography>
          </Box>
          <Typography fontSize={12} color="text.secondary">
            ¿Necesitas ayuda?{' '}
            <Link href="/contacto" underline="hover" fontWeight={600} fontSize={12}>
              Contáctanos
            </Link>
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 400 }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Crear cuenta
              </Typography>
              <Typography sx={{ color: 'text.secondary' }} mt={0.5}>
                Regístrate con tus datos.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Stack spacing={2.5}>
              <Stack direction="row" spacing={2}>
                <TextField 
                  fullWidth label="Nombres" name="nombres" 
                  value={formData.nombres} onChange={handleChange} required 
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
                <TextField 
                  fullWidth label="Apellidos" name="apellidos" 
                  value={formData.apellidos} onChange={handleChange} required 
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </Stack>
              
              <TextField 
                fullWidth label="Teléfono" name="telefono"
                value={formData.telefono} onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <TextField 
                fullWidth label="Correo electrónico" name="email" type="email"
                value={formData.email} onChange={handleChange} required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <TextField 
                fullWidth label="Contraseña" name="password" type="password"
                value={formData.password} onChange={handleChange} required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }
                }}
              />
              
              <TextField 
                fullWidth label="Confirmar contraseña" name="confirmPassword" type="password"
                value={formData.confirmPassword} onChange={handleChange} required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
              
              <Typography variant="body2" color="text.secondary" align="center">
                ¿Ya tienes cuenta?{' '}
                <Link component={RouterLink} to="/login" underline="hover">
                  Inicia sesión
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};