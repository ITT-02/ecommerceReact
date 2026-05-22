import { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import SearchOffIcon from '@mui/icons-material/SearchOff';

import { backendMsg, getModuleColor, groupByModule } from './roleHelpers';

export const RoleAssignPermissionsDialog = ({
  open,
  role,
  permissionOptions,
  getRoleDetail,
  canManagePermissions,
  onClose,
  onSave,
}) => {
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [filter, setFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open || !role) return;
    let cancelled = false;

    const load = async () => {
      setLoadingDetail(true);
      setError(null);
      setFilter('');
      try {
        const detail = await getRoleDetail(role.id);
        if (!cancelled) setSelected(new Set((detail.permisos || []).map((p) => p.codigo)));
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [open, role, getRoleDetail]);

  const grouped = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const filtered = q
      ? permissionOptions.filter((p) =>
          [p.codigo, p.nombre, p.descripcion].join(' ').toLowerCase().includes(q)
        )
      : permissionOptions;
    return groupByModule(filtered);
  }, [permissionOptions, filter]);

  if (!role) return null;

  const isSuperAdmin = role.codigo === 'super_admin';
  const isCliente = role.codigo === 'cliente';
  const locked = !canManagePermissions || isSuperAdmin || isCliente;

  const toggle = (codigo) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(codigo) ? next.delete(codigo) : next.add(codigo);
      return next;
    });
  };

  const toggleModule = (items, allOn) => {
    setSelected((prev) => {
      const next = new Set(prev);
      items.forEach((p) => (allOn ? next.delete(p.codigo) : next.add(p.codigo)));
      return next;
    });
  };

  const handleSave = async () => {
    setConfirmOpen(false);
    setSaving(true);
    setError(null);
    try {
      const permisos = permissionOptions.filter((p) => selected.has(p.codigo));
      await onSave({ id: role.id, permisos });
      onClose();
    } catch (e) {
      setError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={saving ? undefined : onClose}
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
          <KeyOutlinedIcon fontSize="small" />
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            Asignar permisos
            <Tooltip title="Solo un super administrador puede modificar permisos. Los roles super_admin y cliente están protegidos.">
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <InfoOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <IconButton size="small" onClick={onClose} disabled={saving}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {(loadingDetail || saving) && <LinearProgress />}

        <DialogContent dividers sx={{ p: 3 }}>
          {locked && (
            <Alert
              severity={isSuperAdmin || isCliente ? 'warning' : 'info'}
              icon={<LockOutlinedIcon fontSize="inherit" />}
              sx={{ mb: 2 }}
            >
              <AlertTitle>Permisos bloqueados</AlertTitle>
              {isSuperAdmin && (
                <>
                  El rol <b>super_admin</b> tiene todos los permisos por diseño y no puede
                  modificarse.
                </>
              )}
              {isCliente && (
                <>
                  El rol <b>cliente</b> no recibe permisos administrativos.
                </>
              )}
              {!isSuperAdmin && !isCliente && (
                <>Este rol no acepta cambios de permisos en este momento.</>
              )}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {backendMsg(error)}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth size="small" label="Rol" value={role.nombre} disabled />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Código"
                value={role.codigo}
                disabled
                slotProps={{
                  input: { sx: { fontFamily: 'ui-monospace, monospace' } },
                }}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
            <TextField
              size="small"
              placeholder="Filtrar permisos…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ flex: 1, maxWidth: 360 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary">
              <Box component="b" sx={{ color: 'text.primary' }}>
                {selected.size}
              </Box>{' '}
              de {permissionOptions.length} permisos seleccionados
            </Typography>
          </Stack>

          {loadingDetail && (
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={64} />
              <Skeleton variant="rounded" height={64} />
              <Skeleton variant="rounded" height={64} />
            </Stack>
          )}

          {!loadingDetail &&
            grouped.map((g) => {
              const c = getModuleColor(g.modulo);
              const allOn = g.items.every((p) => selected.has(p.codigo));
              const someOn = g.items.some((p) => selected.has(p.codigo));
              return (
                <Accordion
                  key={g.modulo}
                  defaultExpanded
                  disableGutters
                  sx={{
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    '&:before': { display: 'none' },
                    overflow: 'hidden',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      bgcolor: c.bg,
                      '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1 },
                    }}
                  >
                    <Checkbox
                      size="small"
                      disabled={locked}
                      checked={allOn}
                      indeterminate={!allOn && someOn}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleModule(g.items, allOn)}
                      sx={{
                        p: 0.5,
                        color: c.fg,
                        '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: c.fg },
                      }}
                    />
                    <Typography
                      sx={{ fontWeight: 600, color: c.fg, textTransform: 'capitalize' }}
                    >
                      {g.modulo}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${g.items.filter((p) => selected.has(p.codigo)).length}/${g.items.length}`}
                      sx={{
                        height: 20,
                        bgcolor: 'rgba(255,255,255,.7)',
                        color: c.fg,
                        fontWeight: 500,
                      }}
                    />
                  </AccordionSummary>

                  <AccordionDetails sx={{ p: 0 }}>
                    <FormGroup>
                      {g.items.map((p, i) => (
                        <Box
                          key={p.codigo}
                          sx={{
                            px: 2,
                            py: 1.25,
                            borderTop: i === 0 ? 'none' : '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5,
                          }}
                        >
                          <Checkbox
                            size="small"
                            disabled={locked}
                            checked={selected.has(p.codigo)}
                            onChange={() => toggle(p.codigo)}
                            sx={{ p: 0.5, mt: -0.25 }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
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
                        </Box>
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
              );
            })}

          {!loadingDetail && grouped.length === 0 && (
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                color: 'text.disabled',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1.5,
              }}
            >
              <SearchOffIcon sx={{ fontSize: 28 }} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                No hay permisos que coincidan con &quot;{filter}&quot;
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            Se reemplazarán todos los permisos del rol al guardar.
          </Typography>
          <Button onClick={onClose} color="inherit" disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={() => setConfirmOpen(true)}
            variant="contained"
            disabled={locked || loadingDetail || saving}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveOutlinedIcon fontSize="small" />
              )
            }
            sx={{ minWidth: 180 }}
          >
            {saving ? 'Guardando…' : 'Guardar permisos'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberOutlinedIcon sx={{ color: '#d97706' }} />
          Confirmar cambio de permisos
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Esto <b>reemplazará todos los permisos actuales</b> del rol{' '}
            <b>{role.nombre}</b> por los seleccionados ({selected.size}).
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            La acción es inmediata y queda registrada.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained" color="warning">
            Sí, reemplazar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
