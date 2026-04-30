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

// Luego úsalos directamente:
<Box sx={{
  color: colors.primary[500],
  borderRadius: (theme) => theme.palette.custom.radius.md,
  width: (theme) => theme.palette.custom.layout.sidebarWidth,
}} />

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
        width: '40%', minWidth: 300,
        background:(theme)=> `linear-gradient(155deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        display: 'flex', flexDirection: 'column',
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
              Gestion y tienda online para empaques
            </Typography>
            <Typography sx={{lineHeight:1.8, color : colors.primary[50] }}>
              Administra productos, inventario, pedidos y pagos.
            </Typography>
          </Box>
          {/* Feature pills */}
          {['Inventario en tiempo real',
          'Pedidos y facturación',
          'Tienda online integrada'].map(feat => (
          <Box key={feat} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            bgcolor: colors.primary[400],
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
        flex:1,display:'flex',
        alignItems: 'center', justifyContent:'center',
        p:{xs:3, md:6},
      }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            maxWidth: 400,
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

    // <Card>
    //   <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
    //     <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
    //       {error && (
    //         <Alert severity="error" sx={{ width: '100%' }}>
    //           {error}
    //         </Alert>
    //       )}

    //       <AuthPageShell
    //         title="Iniciar sesión"
    //         subtitle="Ingresa con tu usuario registrado."
    //       >
    //         <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
    //           <Stack spacing={2}>
    //             <TextField
    //               name="email"
    //               label="Correo electrónico"
    //               type="email"
    //               value={formData.email}
    //               onChange={handleChange}
    //               required
    //             />

    //             <TextField
    //               name="password"
    //               label="Contraseña"
    //               type="password"
    //               value={formData.password}
    //               onChange={handleChange}
    //               required
    //             />

    //             <Button
    //               type="submit"
    //               variant="contained"
    //               size="large"
    //               disabled={loading}
    //             >
    //               {loading ? 'Ingresando...' : 'Ingresar'}
    //             </Button>
    //           </Stack>
    //         </Box>

    //         <Typography variant="body2" color="text.secondary">
    //           ¿Eres cliente nuevo?{' '}
    //           <Link component={RouterLink} to="/registro" underline="hover">
    //             Crear cuenta
    //           </Link>
    //         </Typography>
    //       </AuthPageShell>
    //     </Stack>
    //   </CardContent>
    // </Card>
  );
};