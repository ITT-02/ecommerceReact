import { useEffect, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EditOffOutlinedIcon from '@mui/icons-material/EditOffOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';

import { backendMsg, fmtDate, getModuleColor, groupByModule } from './roleHelpers';

export const RoleDetailDialog = ({ open, roleId, getRoleDetail, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !roleId) return;
    setLoading(true);
    setError(null);
    setData(null);
    getRoleDetail(roleId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [open, roleId, getRoleDetail]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { height: 'calc(100vh - 80px)' } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <VisibilityOutlinedIcon fontSize="small" />
        <Box sx={{ flex: 1 }}>
          Detalle del rol
          {data && (
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ ml: 1, fontFamily: 'ui-monospace, monospace' }}
            >
              {data.codigo}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {loading && <LinearProgress />}

      <DialogContent dividers sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>No se pudo cargar el rol</AlertTitle>
            {backendMsg(error)}
          </Alert>
        )}

        {loading && !data && (
          <Stack spacing={2}>
            <Skeleton height={32} width="40%" />
            <Skeleton height={20} width="80%" />
            <Skeleton variant="rounded" height={120} />
            <Skeleton variant="rounded" height={200} />
          </Stack>
        )}

        {data && (
          <Box>
            <Typography variant="overline" color="text.secondary">
              Datos del rol
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5, mb: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nombre"
                  value={data.nombre}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código"
                  value={data.codigo}
                  disabled
                  slotProps={{
                    input: { sx: { fontFamily: 'ui-monospace, monospace' } },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Descripción"
                  multiline
                  minRows={2}
                  value={data.descripcion || 'Sin descripción'}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Fecha de creación"
                  value={fmtDate(data.created_at)}
                  disabled
                />
              </Grid>
            </Grid>

            <Typography variant="overline" color="text.secondary">
              Estado
            </Typography>
            <Stack spacing={1} sx={{ mt: 0.5, mb: 2 }}>
              <Alert
                severity={data.es_protegido ? 'warning' : 'info'}
                icon={
                  data.es_protegido ? (
                    <GppGoodOutlinedIcon fontSize="inherit" />
                  ) : (
                    <CheckCircleOutlinedIcon fontSize="inherit" />
                  )
                }
              >
                {data.es_protegido ? (
                  <>
                    Este es un <b>rol protegido del sistema</b>. No puede crearse ni eliminarse.
                  </>
                ) : (
                  <>Rol regular. Puede editarse según permisos del usuario actual.</>
                )}
              </Alert>
              {!data.puede_editar && (
                <Alert severity="info" icon={<EditOffOutlinedIcon fontSize="inherit" />}>
                  El nombre y descripción de este rol <b>no son editables</b> en este momento.
                </Alert>
              )}
              {!data.puede_asignar_permisos && (
                <Alert severity="info" icon={<LockOutlinedIcon fontSize="inherit" />}>
                  {data.codigo === 'cliente'
                    ? 'El rol cliente no recibe permisos administrativos.'
                    : 'No se pueden asignar permisos a este rol en este momento.'}
                </Alert>
              )}
            </Stack>

            <Typography variant="overline" color="text.secondary">
              Permisos asignados ({data.permisos?.length || 0})
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              {(!data.permisos || data.permisos.length === 0) && (
                <Box
                  sx={{
                    p: 3,
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  <BlockOutlinedIcon sx={{ fontSize: 28 }} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Este rol no tiene permisos asignados.
                  </Typography>
                </Box>
              )}

              {groupByModule(data.permisos || []).map((g) => {
                const c = getModuleColor(g.modulo);
                return (
                  <Paper key={g.modulo} variant="outlined" sx={{ mb: 1.5, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        bgcolor: c.bg,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <FolderOutlinedIcon sx={{ fontSize: 16, color: c.fg }} />
                      <Typography
                        variant="subtitle2"
                        sx={{ color: c.fg, textTransform: 'capitalize' }}
                      >
                        {g.modulo}{' '}
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{ color: c.fg, opacity: 0.8, ml: 0.5 }}
                        >
                          ({g.items.length})
                        </Typography>
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5 }}>
                      <Stack divider={<Divider flexItem />} spacing={1.25}>
                        {g.items.map((p) => (
                          <Box key={p.codigo}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                              sx={{ mb: 0.25 }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {p.nombre}
                              </Typography>
                              <Chip
                                size="small"
                                label={p.codigo}
                                sx={{
                                  height: 20,
                                  fontFamily: 'ui-monospace, monospace',
                                  bgcolor: '#f1f5f9',
                                  color: '#475569',
                                }}
                              />
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {p.descripcion}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
