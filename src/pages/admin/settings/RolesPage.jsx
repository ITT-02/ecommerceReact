import { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Button,
  Skeleton,
  Stack,
  TextField,
  Typography,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Grid as MuiGrid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EditOffOutlinedIcon from '@mui/icons-material/EditOffOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';

import { AdminDialog } from '../../../components/common/adminDialog/AdminDialog';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { useRoles } from '../../../hooks/users/useRoles';
import { useAuth } from '../../../hooks/auth/useAuth';
import { hasAllowedRole } from '../../../utils/access/menuByRole';

import { RoleCard } from './componentsRoles/RoleCard';
import { RoleAssignPermissionsDialog } from './componentsRoles/RoleAssignPermissionsDialog';
import { backendMsg, fmtDate, getModuleColor, groupByModule } from './componentsRoles/roleHelpers';

export const RolesPage = () => {
  const [search, setSearch] = useState('');
  const [detailRole, setDetailRole] = useState(null);
  const [detailRoleData, setDetailRoleData] = useState(null);
  const [detailRoleLoading, setDetailRoleLoading] = useState(false);
  const [detailRoleError, setDetailRoleError] = useState(null);
  const [editRole, setEditRole] = useState(null);
  const [editRoleNombre, setEditRoleNombre] = useState('');
  const [editRoleDescripcion, setEditRoleDescripcion] = useState('');
  const [editRoleTouched, setEditRoleTouched] = useState(false);
  const [editRoleSaving, setEditRoleSaving] = useState(false);
  const [editRoleError, setEditRoleError] = useState(null);
  const [assignRole, setAssignRole] = useState(null);

  const theme = useTheme();

  const { roles: userRoles } = useAuth();
  const SUPER_ADMIN_ROLES = ['super_admin'];

  const canManagePermissions = hasAllowedRole(userRoles, SUPER_ADMIN_ROLES);

  const {
    roles,
    permissionOptions,
    loading,
    error,
    getRoleDetail,
    updateRole,
    assignRolePermissions,
  } = useRoles({ search });

  const closeDetailRole = () => {
    setDetailRole(null);
    setDetailRoleData(null);
    setDetailRoleError(null);
    setDetailRoleLoading(false);
  };

  const handleDetailRole = async (role) => {
    if (!role?.id) return;

    setDetailRole(role);
    setDetailRoleLoading(true);
    setDetailRoleError(null);
    setDetailRoleData(null);

    try {
      const data = await getRoleDetail(role.id);
      setDetailRoleData(data);
    } catch (errorDetail) {
      setDetailRoleError(errorDetail);
    } finally {
      setDetailRoleLoading(false);
    }
  };

  const closeEditRole = () => {
    setEditRole(null);
    setEditRoleNombre('');
    setEditRoleDescripcion('');
    setEditRoleTouched(false);
    setEditRoleSaving(false);
    setEditRoleError(null);
  };

  const handleEditRole = (role) => {
    if (!role?.id) return;

    setEditRole(role);
    setEditRoleNombre(role.nombre || '');
    setEditRoleDescripcion(role.descripcion || '');
    setEditRoleTouched(false);
    setEditRoleSaving(false);
    setEditRoleError(null);
  };

  const handleSaveEditedRole = async () => {
    setEditRoleTouched(true);

    if (!editRoleNombre.trim()) return;

    setEditRoleSaving(true);
    setEditRoleError(null);

    try {
      await updateRole({
        id: editRole.id,
        nombre: editRoleNombre.trim(),
        descripcion: editRoleDescripcion.trim() || null,
      });

      closeEditRole();
    } catch (errorSave) {
      setEditRoleError(errorSave);
    } finally {
      setEditRoleSaving(false);
    }
  };

  return (
    <PlaceholderPage
      title="Roles"
      description="Gestiona roles del sistema. Solo puedes editar nombre, descripción y permisos."
    >
      <Container maxWidth={false}>
        <Stack spacing={2.5}>
          <ErrorMessage message={error} />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
          >
            <TextField
              label="Buscar rol"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ maxWidth: { md: 360 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearch('')}
                        aria-label="Limpiar búsqueda"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Stack>

          <Grid container spacing={2}>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Paper
                    variant="outlined"
                    sx={(theme) => ({
                      p: 2,
                      bgcolor:
                        theme.palette.custom.semantic.dataTable?.rowBg ||
                        theme.palette.background.paper,
                    })}
                  >
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      mb: 1.5,
                      alignItems: 'center',
                    }}
                  >
                      <Skeleton variant="rounded" width={40} height={40} />

                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="70%" />
                        <Skeleton width="40%" />
                      </Box>
                    </Stack>

                    <Skeleton width="100%" />
                    <Skeleton width="90%" />

                    <Box sx={{ mt: 2, display: 'flex', gap: 0.5 }}>
                      <Skeleton variant="rounded" width={80} height={22} />
                      <Skeleton variant="rounded" width={80} height={22} />
                    </Box>
                  </Paper>
                </Grid>
              ))}

            {!loading && roles.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={(theme) => ({
                    p: 4,
                    borderRadius: 3,
                    border: '1px dashed',
                    borderColor:
                      theme.palette.custom.semantic.dataTable?.cellBorder ||
                      theme.palette.divider,
                    textAlign: 'center',
                    bgcolor:
                      theme.palette.custom.semantic.dataTable?.rowBg ||
                      theme.palette.background.paper,
                  })}
                >
                  <Typography variant="h6">No se encontraron roles</Typography>

                  <Typography variant="body2" color="text.secondary">
                    {search
                      ? 'Ajusta la búsqueda o límpiala.'
                      : 'No hay roles registrados.'}
                  </Typography>
                </Box>
              </Grid>
            )}

            {!loading &&
              roles.map((role) => (
                <Grid key={role.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <RoleCard
                    role={role}
                    canManagePermissions={canManagePermissions}
                    onDetail={handleDetailRole}
                    onEdit={handleEditRole}
                    onAssign={setAssignRole}
                  />
                </Grid>
              ))}
          </Grid>
        </Stack>
      </Container>
      

      {/* Modal para ver detalle del rol, incluyendo permisos asignados */}
      <AdminDialog
        open={Boolean(detailRole)}
        onClose={closeDetailRole}
        maxWidth="md"
        title="Detalle del rol"
        loading={detailRoleLoading}
        children={
          <>
            {detailRoleLoading && !detailRoleData && (
              <Stack spacing={2}>
                <Skeleton height={32} width="40%" />
                <Skeleton height={20} width="80%" />
                <Skeleton variant="rounded" height={120} />
                <Skeleton variant="rounded" height={200} />
              </Stack>
            )}

            {detailRoleError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <AlertTitle>No se pudo cargar el rol</AlertTitle>
                {backendMsg(detailRoleError)}
              </Alert>
            )}

            {detailRoleData && (
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Datos del rol
                </Typography>

                <Grid container spacing={2} sx={{ mt: 0.5, mb: 2 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth size="small" label="Nombre" value={detailRoleData.nombre} disabled />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Código"
                      value={detailRoleData.codigo}
                      disabled
                      slotProps={{
                        input: {
                          sx: {
                            fontFamily:
                              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          },
                        },
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
                      value={detailRoleData.descripcion || 'Sin descripción'}
                      disabled
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Fecha de creación"
                      value={fmtDate(detailRoleData.created_at)}
                      disabled
                    />
                  </Grid>
                </Grid>

                <Typography variant="overline" color="text.secondary">
                  Estado
                </Typography>

                <Stack spacing={1} sx={{ mt: 0.5, mb: 2 }}>
                  <Alert
                    severity={detailRoleData.es_protegido ? 'warning' : 'info'}
                    icon={detailRoleData.es_protegido ? <GppGoodOutlinedIcon fontSize="inherit" /> : <CheckCircleOutlinedIcon fontSize="inherit" />}
                  >
                    {detailRoleData.es_protegido ? (
                      <>
                        Este es un <b>rol protegido del sistema</b>. No puede crearse ni eliminarse.
                      </>
                    ) : (
                      <>Rol regular. Puede editarse según permisos del usuario actual.</>
                    )}
                  </Alert>

                  {!detailRoleData.puede_editar && (
                    <Alert severity="info" icon={<EditOffOutlinedIcon fontSize="inherit" />}>
                      El nombre y descripción de este rol <b>no son editables</b> en este momento.
                    </Alert>
                  )}

                  {!detailRoleData.puede_asignar_permisos && (
                    <Alert severity="info" icon={<LockOutlinedIcon fontSize="inherit" />}>
                      {detailRoleData.codigo === 'cliente'
                        ? 'El rol cliente no recibe permisos administrativos.'
                        : 'No se pueden asignar permisos a este rol en este momento.'}
                    </Alert>
                  )}
                </Stack>

                <Typography variant="overline" color="text.secondary">
                  Permisos asignados ({detailRoleData.permisos?.length || 0})
                </Typography>

                <Box sx={{ mt: 0.5 }}>
                  {(!detailRoleData.permisos || detailRoleData.permisos.length === 0) && (
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

                  {groupByModule(detailRoleData.permisos || []).map((g) => {
                    const c = getModuleColor(g.modulo, theme);

                    return (
                      <Paper
                        key={g.modulo}
                        variant="outlined"
                        sx={{
                          mb: 1.5,
                          overflow: 'hidden',
                          borderColor: c.border || 'divider',
                        }}
                      >
                        <Box
                          sx={{
                            px: 2,
                            py: 1,
                            bgcolor: c.bg,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            borderBottom: '1px solid',
                            borderColor: c.border || 'divider',
                          }}
                        >
                          <FolderOutlinedIcon sx={{ fontSize: 16, color: c.fg }} />

                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: c.fg,
                              textTransform: 'capitalize',
                              fontWeight: 600,
                            }}
                          >
                            {g.modulo}{' '}

                            <Typography
                              component="span"
                              variant="caption"
                              sx={{
                                color: c.fg,
                                opacity: 0.8,
                                ml: 0.5,
                              }}
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
                                  spacing={1}
                                  sx={{
                                    mb: 0.25,
                                    alignItems: 'center',
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {p.nombre}
                                  </Typography>

                                  <Chip
                                    size="small"
                                    label={p.codigo}
                                    sx={{
                                      height: 20,
                                      fontFamily:
                                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                      bgcolor:
                                        theme.palette.custom.semantic.dataTable?.codeBg ||
                                        theme.palette.action.selected,
                                      color:
                                        theme.palette.custom.semantic.dataTable?.codeText ||
                                        theme.palette.text.secondary,
                                      border: '1px solid',
                                      borderColor:
                                        theme.palette.custom.semantic.dataTable?.codeBorder ||
                                        theme.palette.divider,
                                      fontWeight: 500,
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
          </>
        }
        actions={(
          <Button onClick={closeDetailRole} variant="contained">
            Cerrar
          </Button>
        )}
      >
      </AdminDialog>


      {/* Modal para editar rol (solo nombre y descripción, no código ni permisos) */}
      <AdminDialog
        open={Boolean(editRole)}
        onClose={closeEditRole}
        maxWidth="sm"
        title={`Editar rol`}
        loading={editRoleSaving}
        children={
          <>
            {editRole && (
              <Stack spacing={2.5}>
                {editRole.codigo === 'super_admin' && (
                  <Alert
                    severity="warning"
                    icon={<GppGoodOutlinedIcon fontSize="inherit" />}
                  >
                    <AlertTitle>Rol protegido</AlertTitle>
                    <b>super_admin</b> es un rol del sistema y no puede modificarse desde el panel.
                  </Alert>
                )}

                {editRole.codigo !== 'super_admin' && !editRole.puede_editar && (
                  <Alert severity="info">
                    No tienes permisos para editar este rol en este momento.
                  </Alert>
                )}

                {editRoleError && (
                  <Alert severity="error">
                    <AlertTitle>Error al guardar</AlertTitle>
                    {backendMsg(editRoleError)}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  size="small"
                  label="Código (no editable)"
                  value={editRole.codigo}
                  disabled
                  helperText="El código es inmutable y no se envía al backend."
                  slotProps={{
                    input: {
                      sx: {
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Nombre"
                  value={editRoleNombre}
                  onChange={(e) => setEditRoleNombre(e.target.value)}
                  disabled={editRole.codigo === 'super_admin' || !editRole.puede_editar}
                  error={editRoleTouched && !editRoleNombre.trim()}
                  helperText={editRoleTouched && !editRoleNombre.trim() ? 'El nombre es obligatorio' : ''}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Descripción"
                  multiline
                  minRows={3}
                  maxRows={6}
                  value={editRoleDescripcion}
                  onChange={(e) => setEditRoleDescripcion(e.target.value)}
                  disabled={editRole.codigo === 'super_admin' || !editRole.puede_editar}
                  helperText="Opcional. Si lo dejas vacío se enviará null."
                />
              </Stack>
            )}
          </>
        }
        actions={(
          <>
            <Button onClick={closeEditRole} color="inherit" disabled={editRoleSaving}>
              Cancelar
            </Button>

            <Button
              onClick={handleSaveEditedRole}
              variant="contained"
              disabled={editRoleSaving || !editRole || !editRoleNombre.trim()}
              sx={{ minWidth: 160 }}
            >
              {editRoleSaving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </>
        )}
      >
      </AdminDialog>

      <RoleAssignPermissionsDialog
        open={Boolean(assignRole)}
        role={assignRole}
        permissionOptions={permissionOptions}
        getRoleDetail={getRoleDetail}
        canManagePermissions={canManagePermissions}
        onClose={() => setAssignRole(null)}
        onSave={assignRolePermissions}
      />
    </PlaceholderPage>
  );
};