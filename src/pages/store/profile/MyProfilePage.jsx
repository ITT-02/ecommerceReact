import React, { useState } from 'react';
import {
  Box, Typography, Paper, Divider, Button, CircularProgress,
  Avatar, useTheme, List, ListItemButton, ListItemText, ListItemIcon, alpha,
  useMediaQuery,
} from '@mui/material';

import EditIcon         from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PersonOutlined   from '@mui/icons-material/PersonOutlined';
import HomeOutlined     from '@mui/icons-material/HomeOutlined';
import AddIcon          from '@mui/icons-material/Add';

// Tus componentes reales — sin tocar
import ProfileForm       from './components/ProfileForm';
import { AddressCard }   from './components/AddressCard';
import { AddressDialog } from './components/AddressDialog';
import { useMyProfile }  from '../../../hooks/store/useMyProfile';

export const MyProfilePage = () => {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px

  const { profile = {}, isLoadingProfile, addresses = [], isLoadingAddresses } = useMyProfile() || {};

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [selectedAddress,   setSelectedAddress]   = useState(null);

  const handleOpen  = (address = null) => { setSelectedAddress(address); setAddressDialogOpen(true);  };
  const handleClose = ()               => { setAddressDialogOpen(false); setSelectedAddress(null);    };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    
    // Si estamos en la sección de información personal y ya estamos bastante arriba, no hacemos scroll 
    // para evitar que el título principal de la página desaparezca.
    if (id === 'info-personal' && window.scrollY < 150) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: 'smooth' });
  };

  if (isLoadingProfile || isLoadingAddresses) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const userName  = profile?.nombres || profile?.nombre_completo || 'Usuario';
  const userEmail = profile?.email   || profile?.correo          || 'cliente@ejemplo.com';
  const userInit  = userName?.[0]?.toUpperCase() || 'U';

  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      <Box sx={{ maxWidth: 1140, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 5 } }}>

        {/* ── Título ─────────────────────────────────── */}
        <Box sx={{ mb: { xs: 3, md: 5 } }}>
          <Typography fontWeight={800} color="text.primary" letterSpacing="-0.5px"
            sx={{ fontSize: { xs: '1.6rem', sm: '1.9rem', md: '2.1rem' } }}>
            Detalles de la cuenta
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
            Administra tu información personal y direcciones para tus pedidos.
          </Typography>
        </Box>

        {/*
          ── Layout principal con CSS Grid nativo ─────
          Usamos CSS Grid directamente en lugar de MUI Grid para evitar
          los problemas de compatibilidad entre versiones de MUI.

          Mobile (< 900px): 1 columna
          Desktop (≥ 900px): sidebar 280px fijo + contenido ocupa el resto
        */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '260px 1fr' },
          gap: { xs: 2, md: 3, lg: 4 },
          alignItems: 'start',
        }}>

          {/* ═══════════════════════════════════════════ */}
          {/* COLUMNA IZQUIERDA — sidebar               */}
          {/* ═══════════════════════════════════════════ */}
          <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>

            {/* Tarjeta de identidad */}
            <Paper elevation={0} sx={{
              p: { xs: 3, md: 3 },
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              mb: 2,
            }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar sx={{
                  width: { xs: 88, md: 96 },
                  height: { xs: 88, md: 96 },
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                  fontSize: { xs: '2rem', md: '2.3rem' },
                  fontWeight: 700,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}>
                  {userInit}
                </Avatar>
                <Box sx={{
                  position: 'absolute', bottom: 2, right: 2,
                  bgcolor: 'primary.dark', color: '#fff',
                  borderRadius: '50%', p: '4px',
                  border: '2.5px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.main' },
                }}>
                  <EditIcon sx={{ fontSize: 13 }} />
                </Box>
              </Box>

              <Typography fontWeight={800} sx={{ mb: 0.4, fontSize: '1rem' }}>
                {userName}
              </Typography>
              <Typography color="text.secondary"
                sx={{ mb: 2, fontSize: '0.78rem', wordBreak: 'break-word' }}>
                {userEmail}
              </Typography>

              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.6,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.dark,
                px: 1.75, py: 0.6, borderRadius: 5,
              }}>
                <VerifiedUserIcon sx={{ fontSize: 14 }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize' }}>
                  {profile?.estado || 'Cuenta Verificada'}
                </Typography>
              </Box>
            </Paper>

            {/* Navegación rápida — solo desktop */}
            {!isMobile && (
              <Paper elevation={0} sx={{
                p: 2, borderRadius: 3,
                border: '1px solid', borderColor: 'divider',
              }}>
                <Typography sx={{
                  display: 'block', px: 1.5, mb: 0.75,
                  fontSize: '0.68rem', fontWeight: 700,
                  color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  Navegación rápida
                </Typography>
                <List disablePadding dense>
                  <ListItemButton
                    onClick={() => scrollToSection('info-personal')}
                    sx={{ borderRadius: 2, mb: 0.5, py: 0.75, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.07) } }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <PersonOutlined color="primary" sx={{ fontSize: 17 }} />
                    </ListItemIcon>
                    {/* En MUI v6 se usa slotProps en lugar de primaryTypographyProps */}
                    <ListItemText
                      primary="Información Personal"
                      slotProps={{ primary: { style: { fontWeight: 600, fontSize: '0.85rem' } } }}
                    />
                  </ListItemButton>
                  <ListItemButton
                    onClick={() => scrollToSection('direcciones-envio')}
                    sx={{ borderRadius: 2, py: 0.75, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.07) } }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <HomeOutlined color="primary" sx={{ fontSize: 17 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Mis Direcciones"
                      slotProps={{ primary: { style: { fontWeight: 600, fontSize: '0.85rem' } } }}
                    />
                  </ListItemButton>
                </List>
              </Paper>
            )}

          </Box>

          {/* ═══════════════════════════════════════════ */}
          {/* COLUMNA DERECHA — formularios              */}
          {/* ═══════════════════════════════════════════ */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>

            {/* Sección 1: Información Personal */}
            <Paper
              id="info-personal"
              elevation={0}
              sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
            >
              <Box sx={{ mb: 2.5 }}>
                <Typography fontWeight={700} sx={{ fontSize: { xs: '1.05rem', md: '1.2rem' } }}>
                  Información Personal
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Actualiza tus datos para tus futuras compras.
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              {profile
                ? <ProfileForm initialData={profile} />
                : <Typography color="text.secondary">Cargando datos…</Typography>
              }
            </Paper>

            {/* Sección 2: Direcciones */}
            <Paper
              id="direcciones-envio"
              elevation={0}
              sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
            >
              <Box sx={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', mb: 2.5,
                flexWrap: 'wrap', gap: 1.5,
              }}>
                <Box>
                  <Typography fontWeight={700} sx={{ fontSize: { xs: '1.05rem', md: '1.2rem' } }}>
                    Libreta de Direcciones
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {addresses?.length || 0}{' '}
                    {addresses?.length === 1 ? 'dirección guardada' : 'direcciones guardadas'}
                  </Typography>
                </Box>
                <Button
                  variant="outlined" disableElevation
                  startIcon={<AddIcon />}
                  onClick={() => handleOpen()}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Nueva Dirección
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />

              {!addresses?.length ? (
                <Box sx={{
                  p: { xs: 4, md: 5 }, textAlign: 'center',
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 2, border: '2px dashed', borderColor: 'divider',
                }}>
                  <HomeOutlined sx={{ fontSize: 36, color: 'text.secondary', mb: 1, opacity: 0.45 }} />
                  <Typography fontWeight={600} sx={{ mb: 0.75 }}>
                    No tienes direcciones guardadas
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Agrega tu primer domicilio para calcular el envío.
                  </Typography>
                  <Button variant="contained" disableElevation startIcon={<AddIcon />}
                    onClick={() => handleOpen()} sx={{ borderRadius: 2 }}>
                    Añadir mi primera dirección
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {addresses.map((address) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      onEdit={() => handleOpen(address)}
                    />
                  ))}
                </Box>
              )}
            </Paper>

          </Box>

        </Box>{/* fin CSS Grid */}

        <AddressDialog
          open={addressDialogOpen}
          onClose={handleClose}
          address={selectedAddress}
          isFirstAddress={addresses?.length === 0}
        />

      </Box>
    </Box>
  );
};

export default MyProfilePage;