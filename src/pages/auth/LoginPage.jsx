// Página de inicio de sesión.
// Envía email y password a la API externa y redirige según el rol.

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InventoryIcon from '@mui/icons-material/Inventory';

import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/auth/useAuth';
import { getDefaultPathByRoles } from '../../utils/access/menuByRole';

import { AuthPageShell } from './components/AuthPageShell';
import { colors} from '../../styles/theme';

export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);

  const { login, loading } = useAuth();
  const [showPass, setShowPass] = useState(false);
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
    <Box component="section" sx={{display:'flex', minHeight:'100vh' }}>
     
      <Box sx={{
        width: { md: '40%' },
        minWidth: { md: 300 },
        background:(theme)=> `linear-gradient(155deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
        p: 6, gap: 4,
      }}>
          {/* Logo */}
          <Box sx ={{ display: 'flex', alignItems: 'center', gap: 1.5}}>
            {/* Panel Izquierdo */}
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

          {/* Tagline     */}
          <Box sx={{flex:1,display:'flex', flexDirection: 'column',
                    justifyContent:'center', gap: 2
          }}>
            <Typography variant='h4' fontWeight={700} sx={{color :colors.primary[50] }}>
              Tu plataforma de empaques, en un solo lugar
            </Typography>
            <Typography sx={{lineHeight:1.8, color : colors.primary[50] }}>
              Accede a tus productos,pedidos y cuenta desde cualquier dispositivo
            </Typography>
          </Box>
          {/* Feature pills */}
          {['Catalogo de productos',
          'Seguimiento de pedidos',
          'Pagos y facturacion'].map(feat => (
          <Box key={feat} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            bgcolor: (theme)=>theme.palette.primary.dark,
            borderRadius: 2, px: 1, py: 1.5,
          }}>
            {/* Punto decorativo */}
            <Box sx={{ width: 6, height: 6, borderRadius: '10%',
                       bgcolor: 'white', flexShrink: 0 }} />
            {/* Texto de la pill */}
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
          <Typography variant="h4" fontWeight={700}>
            Iniciar Sesion
          </Typography>
          <Typography sx={{ color: 'text.secondary' }} mt={0.5}>
            Ingresa con tu usuario registrado.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            name="email"
            label="Correo electrónico"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            name="password"
            label="Contraseña"
            type={showPass ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(v => !v)} edge="end">
                      {showPass
                        ? <VisibilityOffIcon fontSize="small" />
                        : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center',
                     justifyContent: 'space-between' }}>
            <FormControlLabel
              control={<Checkbox size="small" />}
              label={<Typography fontSize={13}>Recordarme</Typography>}
            />
            <Link href="/forgot-password" underline="hover"
                  fontSize={13} fontWeight={500}>
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>

          <Typography variant="body2" color="text.secondary">
            ¿Eres cliente nuevo?{' '}
            <Link component={RouterLink} to="/registro" underline="hover">
              Crear cuenta
            </Link>
          </Typography>
        </Box>
        </Box>
      </Box>
    </Box>
  );
};