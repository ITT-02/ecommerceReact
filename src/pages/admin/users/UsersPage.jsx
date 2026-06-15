import { useState } from 'react';
import {
  Chip,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Avatar,
  Stack,
  Divider,
  Button,
  alpha,
  useTheme,
} from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { AdminDialog } from '../../../components/common/adminDialog/AdminDialog';
import { useAdminUsers, useRoleOptions, useAdminUserDetail } from '../../../hooks/users/useAdminUsers';
import { EditUserDialog } from './components/EditUserDialog';
import { AssignRolesDialog } from './components/AssignRolesDialog';

const formatDate = (value) => {
  if (!value) return '-';
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

export const UsersPage = () => {
  const theme = useTheme();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});

  const estado = filterValues?.estado === 'todos' ? null : filterValues?.estado || null;
  const rolCodigo = filterValues?.rol_codigo === 'todos' ? null : filterValues?.rol_codigo || null;

  const { users, pagination, isLoading, editProfile, isEditingProfile, assignRoles, isAssigningRoles } =
    useAdminUsers({ pageNumber, pageSize, search, estado, rolCodigo });

  const { data: roleOptions = [] } = useRoleOptions();

  const [userDetalle, setUserDetalle] = useState(null);
  const { data: userDetalleData, isLoading: userDetalleLoading } = useAdminUserDetail(userDetalle?.id || null);
  const [userEditar, setUserEditar] = useState(null);
  const [userRoles, setUserRoles] = useState(null);

  const columns = [
    {
      field: 'nombre_completo',
      headerName: 'Usuario',
      width: 200,
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.nombre_completo || '-'}
        </Typography>
      ),
    },
    { field: 'email', headerName: 'Correo', width: 230 },
    { field: 'telefono', headerName: 'Teléfono', width: 130, emptyText: '-' },
    {
      field: 'roles_resumen',
      headerName: 'Roles',
      width: 220,
      renderCell: (row) => {
        const roles = (row.roles_resumen || '').split(',').map((r) => r.trim()).filter(Boolean);
        if (!roles.length) return <Typography variant="caption" color="text.disabled">Sin roles</Typography>;
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {roles.map((rol) => (
              <Chip key={rol} label={rol} size="small" variant="outlined" color="primary" />
            ))}
          </Box>
        );
      },
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 120,
      renderCell: (row) => (
        <Chip
          label={row.estado}
          size="small"
          color={getEstadoColor(row.estado)}
          variant="filled"
          sx={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'email_confirmed_at',
      headerName: 'Email confirmado',
      width: 160,
      renderCell: (row) =>
        row.email_confirmed_at ? (
          <Chip label={formatDate(row.email_confirmed_at)} size="small" color="success" variant="outlined" />
        ) : (
          <Chip label="No confirmado" size="small" color="warning" variant="outlined" />
        ),
    },
    {
      field: 'created_at',
      headerName: 'Registro',
      width: 130,
      renderCell: (row) => <Typography variant="caption">{formatDate(row.created_at)}</Typography>,
    },
  ];

  const rowActions = [
    {
      type: 'view',
      label: 'Ver detalle',
      onClick: (row) => setUserDetalle(row),
    },
    {
      type: 'edit',
      label: 'Editar perfil',
      onClick: (row) => setUserEditar(row),
    },
    {
      type: 'assign_roles',
      label: 'Asignar roles',
      onClick: (row) => setUserRoles(row),    
    },
  ];

  const filtersConfig = [
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      options: [
        { label: 'Activo', value: 'activo' },
        { label: 'Inactivo', value: 'inactivo' },
        { label: 'Bloqueado', value: 'bloqueado' },
      ],
    },
    {
      name: 'rol_codigo',
      label: 'Rol',
      type: 'select',
      options: roleOptions.map((r) => ({ label: r.nombre, value: r.codigo })),
    },
  ];

  return (
    <PlaceholderPage
      title="Gestión de Usuarios"
      description="Consulta, edita perfiles y administra los roles de los usuarios registrados."
    >
      <AdminResourceTable
        rows={users}
        columns={columns}
        actions={rowActions}
        loading={isLoading}
        pagination={pagination}
        searchValue={search}
        searchLabel="Buscar por nombre, correo, teléfono o documento..."
        onSearchChange={(val) => { setSearch(val); setPageNumber(1); }}
        filterValues={filterValues}
        filters={filtersConfig}
        onFilterChange={(name, val) => { setFilterValues((prev) => ({ ...prev, [name]: val })); setPageNumber(1); }}
        onResetFilters={() => { setFilterValues({}); setPageNumber(1); }}
        onPageChange={(page) => setPageNumber(page)}
        onPageSizeChange={(size) => { setPageSize(size); setPageNumber(1); }}
        primaryActionLabel={null}
        emptyTitle="No se encontraron usuarios"
        emptyDescription="Ajusta los filtros o el término de búsqueda."
      />

      <AdminDialog
        open={Boolean(userDetalle)}
        onClose={() => setUserDetalle(null)}
        maxWidth="md"
        title="Detalle de Usuario"
        loading={userDetalleLoading}
        actions={<Button onClick={() => setUserDetalle(null)} variant="outlined">Cerrar</Button>}
      >
        {!userDetalleLoading && !userDetalleData && (
          <Typography color="error" align="center" sx={{ py: 4 }}>
            Error al cargar la información del usuario.
          </Typography>
        )}

        {!userDetalleLoading && userDetalleData && (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <SectionCard title="Datos de Cuenta" icon={<AccountCircleOutlinedIcon color="primary" fontSize="small" />}>
                  <InfoRow label="Correo" value={userDetalleData.email} />
                  <InfoRow
                    label="Estado"
                    value={
                      <Chip
                        label={userDetalleData.estado}
                        size="small"
                        color={getEstadoColor(userDetalleData.estado)}
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                    }
                  />
                  <InfoRow
                    label="Email confirmado"
                    value={
                      userDetalleData.email_confirmed_at ? (
                        <Chip label={formatDate(userDetalleData.email_confirmed_at)} size="small" color="success" variant="outlined" />
                      ) : (
                        <Chip label="No confirmado" size="small" color="warning" variant="outlined" />
                      )
                    }
                  />
                  <InfoRow label="Registro" value={formatDate(userDetalleData.created_at)} />
                </SectionCard>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <SectionCard title="Perfil" icon={<PersonOutlinedIcon color="primary" fontSize="small" />}>
                  <InfoRow label="Nombre completo" value={userDetalleData.nombre_completo} />
                  <InfoRow label="Nombres" value={userDetalleData.nombres} />
                  <InfoRow label="Apellidos" value={userDetalleData.apellidos} />
                  <InfoRow label="Teléfono" value={userDetalleData.telefono} />
                  <InfoRow label="Tipo documento" value={userDetalleData.tipo_documento} />
                  <InfoRow label="Documento" value={userDetalleData.documento_identidad} />
                </SectionCard>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <SectionCard title="Roles asignados" icon={<ShieldOutlinedIcon color="primary" fontSize="small" />}>
                  {userDetalleData.roles?.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {userDetalleData.roles.map((rol) => (
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

              <Grid size={{ xs: 12, md: 6 }}>
                <SectionCard title="Permisos heredados" icon={<LockOpenOutlinedIcon color="primary" fontSize="small" />}>
                  {userDetalleData.permisos?.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {userDetalleData.permisos.map((permiso, index) => (
                        <Chip key={index} label={permiso} size="small" variant="outlined" />
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
      </AdminDialog>

      <EditUserDialog
        open={Boolean(userEditar)}
        usuario={userEditar}
        isSaving={isEditingProfile}
        onClose={() => setUserEditar(null)}
        onConfirm={editProfile}
      />

      <AssignRolesDialog
        open={Boolean(userRoles)}
        usuario={userRoles}
        isSaving={isAssigningRoles}
        onClose={() => setUserRoles(null)}
        onConfirm={assignRoles}
      />
    </PlaceholderPage>
  );
};
