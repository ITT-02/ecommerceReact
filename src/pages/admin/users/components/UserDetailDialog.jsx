import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Chip,
  CircularProgress,
  Paper,
  IconButton,
  Avatar,
  Stack,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';

import { useAdminUserDetail } from '../../../../hooks/users/useAdminUsers';

const formatDate = (value) => {
  if (!value) return null;
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const getEstadoColor = (estado) => {
  const colors = { activo: 'success', inactivo: 'default', bloqueado: 'error' };
  return colors[estado] || 'default';
};

const SectionCard = ({ title, icon, children }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.background.default, 0.5),
        height: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
          pb: 1.5,
          borderBottom: `1px dashed ${theme.palette.divider}`,
        }}
      >
        {icon}
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Stack spacing={1.5}>{children}</Stack>
    </Paper>
  );
};

const InfoRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
    <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ flexShrink: 0 }}>
      {label}
    </Typography>
    <Box sx={{ typography: 'body2', fontWeight: 500, textAlign: 'right', wordBreak: 'break-word' }}>
      {value ?? '-'}
    </Box>
  </Box>
);

export const UserDetailDialog = ({ open, usuarioId, onClose }) => {
  const theme = useTheme();
  const { data: detail, isLoading } = useAdminUserDetail(open ? usuarioId : null);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ '& .MuiDialog-paper': { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 40, height: 40 }}>
            <AccountCircleOutlinedIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              Detalle de Usuario
            </Typography>
            {detail && (
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {detail.nombre_completo || detail.email}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ bgcolor: theme.palette.background.paper, boxShadow: 1 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : !detail ? (
          <Typography color="error" align="center" sx={{ py: 4 }}>
            Error al cargar la información del usuario.
          </Typography>
        ) : (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              {/* Datos de cuenta */}
              <Grid size={{ xs: 12, md: 6 }}>
                <SectionCard
                  title="Datos de Cuenta"
                  icon={<AccountCircleOutlinedIcon color="primary" fontSize="small" />}
                >
                  <InfoRow label="Correo" value={detail.email} />
                  <InfoRow
                    label="Estado"
                    value={
                      <Chip
                        label={detail.estado}
                        size="small"
                        color={getEstadoColor(detail.estado)}
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                    }
                  />
                  <InfoRow
                    label="Email confirmado"
                    value={
                      detail.email_confirmed_at ? (
                        <Chip label={formatDate(detail.email_confirmed_at)} size="small" color="success" variant="outlined" />
                      ) : (
                        <Chip label="No confirmado" size="small" color="warning" variant="outlined" />
                      )
                    }
                  />
                  <InfoRow label="Registro" value={formatDate(detail.created_at)} />
                </SectionCard>
              </Grid>

              {/* Perfil */}
              <Grid size={{ xs: 12, md: 6 }}>
                <SectionCard
                  title="Perfil"
                  icon={<PersonOutlinedIcon color="primary" fontSize="small" />}
                >
                  <InfoRow label="Nombre completo" value={detail.nombre_completo} />
                  <InfoRow label="Nombres" value={detail.nombres} />
                  <InfoRow label="Apellidos" value={detail.apellidos} />
                  <InfoRow label="Teléfono" value={detail.telefono} />
                  <InfoRow label="Tipo documento" value={detail.tipo_documento} />
                  <InfoRow label="Documento" value={detail.documento_identidad} />
                </SectionCard>
              </Grid>

              {/* Roles */}
              <Grid size={{ xs: 12, md: 6 }}>
                <SectionCard
                  title="Roles asignados"
                  icon={<ShieldOutlinedIcon color="primary" fontSize="small" />}
                >
                  {detail.roles?.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {detail.roles.map((rol) => (
                        <Chip
                          key={rol.id}
                          label={`${rol.nombre} (${rol.codigo})`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin roles asignados.
                    </Typography>
                  )}
                </SectionCard>
              </Grid>

              {/* Permisos heredados */}
              <Grid size={{ xs: 12, md: 6 }}>
                <SectionCard
                  title="Permisos heredados"
                  icon={<LockOpenOutlinedIcon color="primary" fontSize="small" />}
                >
                  {detail.permisos?.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {detail.permisos.map((permiso, i) => (
                        <Chip
                          key={i}
                          label={permiso}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin permisos heredados.
                    </Typography>
                  )}
                </SectionCard>
              </Grid>

            </Grid>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button variant="outlined" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
