import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  CircularProgress,
  Avatar,
  useTheme,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  alpha,
  useMediaQuery,
  Container,
  Stack,
  Alert,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AddIcon from '@mui/icons-material/Add';

import { ProfileForm } from './profile/components/ProfileForm';
import { AddressCard } from './profile/components/AddressCard';
import { AddressDialog } from './profile/components/AddressDialog';
import { useStoreProfile } from '../../hooks/store/useStoreProfile';

export const ProfilePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    profile = {},
    isLoadingProfile,
    addresses = [],
    isLoadingAddresses,
    error = null,
    notice = null,
    setNotice = () => {},
  } = useStoreProfile() || {};

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const releaseFocus = (event) => {
    if (event?.currentTarget?.blur) {
      event.currentTarget.blur();
      return;
    }

    if (
      document.activeElement &&
      document.activeElement instanceof HTMLElement &&
      document.activeElement.blur
    ) {
      document.activeElement.blur();
    }
  };

  const handleOpenAddressDialog = (event, address = null) => {
    releaseFocus(event);

    window.setTimeout(() => {
      setSelectedAddress(address);
      setAddressDialogOpen(true);
    }, 0);
  };

  const handleCloseAddressDialog = () => {
    setAddressDialogOpen(false);
    setSelectedAddress(null);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (!element) return;

    if (id === 'info-personal' && window.scrollY < 150) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY - 30,
      behavior: 'smooth',
    });
  };

  if (isLoadingProfile || isLoadingAddresses) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const userName = profile?.nombres || profile?.nombre_completo || 'Usuario';
  const userEmail = profile?.email || profile?.correo || 'cliente@ejemplo.com';
  const userInitial = userName?.[0]?.toUpperCase() || 'U';

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { lg: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary.main">
            Cuenta
          </Typography>

          <Typography
            variant="h2"
            sx={{ fontSize: { xs: '2.5rem', md: '3.75rem' } }}
          >
            Mi perfil
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Actualiza tus datos y direcciones para tus próximas compras.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {notice && (
          <Alert severity="success" onClose={() => setNotice('')}>
            {notice}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
            gap: { xs: 2, md: 3, lg: 4 },
            alignItems: 'start',
          }}
        >
          <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 3 },
                textAlign: 'center',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                mb: 2,
              }}
            >
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  sx={{
                    width: { xs: 88, md: 96 },
                    height: { xs: 88, md: 96 },
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontSize: { xs: '2rem', md: '2.3rem' },
                    fontWeight: 700,
                    boxShadow: theme.shadows[4],
                  }}
                >
                  {userInitial}
                </Avatar>

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    bgcolor: 'primary.dark',
                    color: 'primary.contrastText',
                    borderRadius: '50%',
                    p: '4px',
                    border: '2.5px solid',
                    borderColor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EditIcon sx={{ fontSize: 13 }} />
                </Box>
              </Box>

              <Typography fontWeight={800} sx={{ mb: 0.4, fontSize: '1rem' }}>
                {userName}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mb: 2, fontSize: '0.78rem', wordBreak: 'break-word' }}
              >
                {userEmail}
              </Typography>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: 'success.dark',
                  px: 1.75,
                  py: 0.6,
                  borderRadius: 5,
                }}
              >
                <VerifiedUserIcon sx={{ fontSize: 14 }} />

                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                  }}
                >
                  {profile?.estado || 'Cuenta verificada'}
                </Typography>
              </Box>
            </Paper>

            {!isMobile && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  sx={{
                    display: 'block',
                    px: 1.5,
                    mb: 0.75,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Navegación rápida
                </Typography>

                <List disablePadding dense>
                  <ListItemButton
                    onClick={() => scrollToSection('info-personal')}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      py: 0.75,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.07),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <PersonOutlinedIcon color="primary" sx={{ fontSize: 17 }} />
                    </ListItemIcon>

                    <ListItemText
                      primary="Información personal"
                      slotProps={{
                        primary: {
                          style: {
                            fontWeight: 600,
                            fontSize: '0.85rem',
                          },
                        },
                      }}
                    />
                  </ListItemButton>

                  <ListItemButton
                    onClick={() => scrollToSection('direcciones-envio')}
                    sx={{
                      borderRadius: 2,
                      py: 0.75,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.07),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <HomeOutlinedIcon color="primary" sx={{ fontSize: 17 }} />
                    </ListItemIcon>

                    <ListItemText
                      primary="Mis direcciones"
                      slotProps={{
                        primary: {
                          style: {
                            fontWeight: 600,
                            fontSize: '0.85rem',
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                </List>
              </Paper>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
            <Paper
              id="info-personal"
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ mb: 2.5 }}>
                <Typography fontWeight={700} sx={{ fontSize: { xs: '1.05rem', md: '1.2rem' } }}>
                  Información personal
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Actualiza tus datos para tus futuras compras.
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {profile ? (
                <ProfileForm initialData={profile} />
              ) : (
                <Typography color="text.secondary">Cargando datos…</Typography>
              )}
            </Paper>

            <Paper
              id="direcciones-envio"
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2.5,
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography fontWeight={700} sx={{ fontSize: { xs: '1.05rem', md: '1.2rem' } }}>
                    Libreta de direcciones
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {addresses?.length || 0}{' '}
                    {addresses?.length === 1 ? 'dirección guardada' : 'direcciones guardadas'}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  disableElevation
                  startIcon={<AddIcon />}
                  onClick={(event) => handleOpenAddressDialog(event)}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Nueva dirección
                </Button>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {!addresses?.length ? (
                <Box
                  sx={{
                    p: { xs: 4, md: 5 },
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <HomeOutlinedIcon
                    sx={{
                      fontSize: 36,
                      color: 'text.secondary',
                      mb: 1,
                      opacity: 0.45,
                    }}
                  />

                  <Typography fontWeight={600} sx={{ mb: 0.75 }}>
                    No tienes direcciones guardadas
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Agrega tu primer domicilio para completar tus compras.
                  </Typography>

                  <Button
                    variant="contained"
                    disableElevation
                    startIcon={<AddIcon />}
                    onClick={(event) => handleOpenAddressDialog(event)}
                    sx={{ borderRadius: 2 }}
                  >
                    Añadir mi primera dirección
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {addresses.map((address) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      onEdit={(event) => handleOpenAddressDialog(event, address)}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        </Box>

        <AddressDialog
          open={addressDialogOpen}
          onClose={handleCloseAddressDialog}
          address={selectedAddress}
          isFirstAddress={addresses?.length === 0}
        />
      </Stack>
    </Container>
  );
};