import { useState } from 'react';
import { Chip, Typography, Box } from '@mui/material';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useAdminUsers, useRoleOptions } from '../../../hooks/users/useAdminUsers';
import { UserDetailDialog } from './components/UserDetailDialog';
import { EditUserDialog } from './components/EditUserDialog';
import { AssignRolesDialog } from './components/AssignRolesDialog';

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

const getEstadoColor = (estado) => {
  const colors = { activo: 'success', inactivo: 'default', bloqueado: 'error' };
  return colors[estado] || 'default';
};

export const UsersPage = () => {
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

      <UserDetailDialog
        open={Boolean(userDetalle)}
        usuarioId={userDetalle?.id}
        onClose={() => setUserDetalle(null)}
      />

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
