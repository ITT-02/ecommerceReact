import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { useRoles } from '../../../hooks/users/useRoles';
import { useAuth } from '../../../hooks/auth/useAuth';
import { hasAllowedRole } from '../../../utils/access/menuByRole';

import { RoleCard } from './componentsRoles/RoleCard';
import { RoleDetailDialog } from './componentsRoles/RoleDetailDialog';
import { RoleEditDialog } from './componentsRoles/RoleEditDialog';
import { RoleAssignPermissionsDialog } from './componentsRoles/RoleAssignPermissionsDialog';

export const RolesPage = () => {
  const [search, setSearch] = useState('');
  const [detailRole, setDetailRole] = useState(null);
  const [editRole, setEditRole] = useState(null);
  const [assignRole, setAssignRole] = useState(null);

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
                    onDetail={setDetailRole}
                    onEdit={setEditRole}
                    onAssign={setAssignRole}
                  />
                </Grid>
              ))}
          </Grid>
        </Stack>
      </Container>

      <RoleDetailDialog
        open={Boolean(detailRole)}
        roleId={detailRole?.id}
        getRoleDetail={getRoleDetail}
        onClose={() => setDetailRole(null)}
      />

      <RoleEditDialog
        open={Boolean(editRole)}
        role={editRole}
        onClose={() => setEditRole(null)}
        onSave={updateRole}
      />

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