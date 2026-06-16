import { useState, useEffect } from 'react';
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
  TextField,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { AdminDialog } from '../../../components/common/adminDialog/AdminDialog';
import { useAdminUsers, useRoleOptions, useAdminUserDetail } from '../../../hooks/users/useAdminUsers';

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

// Edit user dialog configuration (moved from component)
const TIPO_DOCUMENTO_OPTIONS = [
  { value: 'DNI', label: 'DNI' },
  { value: 'RUC', label: 'RUC' },
  { value: 'CE', label: 'CE' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

const ESTADO_OPTIONS = [
  { value: 'activo', label: 'Activo', color: 'success', desc: 'Opera con normalidad' },
  { value: 'inactivo', label: 'Inactivo', color: 'default', desc: 'Deshabilitado' },
  { value: 'bloqueado', label: 'Bloqueado', color: 'error', desc: 'Restringido' },
];

const DOC_RULES = {
  DNI: { maxLength: 8, exactLength: 8, onlyDigits: true, helper: '8 dígitos numéricos' },
  RUC: { maxLength: 11, exactLength: 11, onlyDigits: true, helper: '11 dígitos numéricos' },
  CE: { maxLength: 12, exactLength: null, onlyDigits: false, helper: 'Máx. 12 caracteres alfanuméricos' },
  PASAPORTE: { maxLength: 20, exactLength: null, onlyDigits: false, helper: 'Máx. 20 caracteres alfanuméricos' },
};

const initialEditForm = {
  nombres: '',
  apellidos: '',
  telefono: '',
  tipo_documento: 'DNI',
  documento_identidad: '',
  estado: 'activo',
};

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

  const { data: roleOptions = [], isLoading: roleOptionsLoading } = useRoleOptions();

  const [userDetalle, setUserDetalle] = useState(null);
  const { data: userDetalleData, isLoading: userDetalleLoading } = useAdminUserDetail(userDetalle?.id || null);
  const [userEditar, setUserEditar] = useState(null);
  const [userRoles, setUserRoles] = useState(null);

  // Edit user form state (moved inline)
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editError, setEditError] = useState('');

  // Assign roles state (moved inline)
  const [selectedCodigos, setSelectedCodigos] = useState([]);
  const [assignError, setAssignError] = useState('');

  useEffect(() => {
    if (userEditar) {
      setEditForm({
        nombres: userEditar.nombres || '',
        apellidos: userEditar.apellidos || '',
        telefono: userEditar.telefono || '',
        tipo_documento: userEditar.tipo_documento || 'DNI',
        documento_identidad: userEditar.documento_identidad || '',
        estado: userEditar.estado || 'activo',
      });
      setEditError('');
    }
  }, [userEditar]);

  useEffect(() => {
    if (userRoles) {
      const current = (userRoles.roles || []).map((r) => r.codigo);
      setSelectedCodigos(current);
      setAssignError('');
    }
  }, [userRoles]);

  const handleToggleRole = (codigo) => {
    setSelectedCodigos((prev) => (prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]));
  };

  const handleEditSubmit = async (e) => {
    e?.preventDefault?.();
    if (!editForm.nombres.trim()) { setEditError('El campo Nombres es obligatorio.'); return; }
    if (!editForm.apellidos.trim()) { setEditError('El campo Apellidos es obligatorio.'); return; }
    const docRules = DOC_RULES[editForm.tipo_documento] || DOC_RULES.DNI;
    const doc = (editForm.documento_identidad || '').trim();
    if (doc) {
      if (docRules.onlyDigits && !/^\d+$/.test(doc)) { setEditError(`El ${editForm.tipo_documento} solo acepta dígitos numéricos.`); return; }
      if (docRules.exactLength && doc.length !== docRules.exactLength) { setEditError(`El ${editForm.tipo_documento} debe tener exactamente ${docRules.exactLength} dígitos.`); return; }
      if (doc.length > docRules.maxLength) { setEditError(`El ${editForm.tipo_documento} no puede superar ${docRules.maxLength} caracteres.`); return; }
    }

    try {
      await editProfile({
        usuarioId: userEditar.id,
        nombres: editForm.nombres.trim(),
        apellidos: editForm.apellidos.trim(),
        telefono: editForm.telefono.trim() || null,
        tipoDocumento: editForm.tipo_documento,
        documentoIdentidad: editForm.documento_identidad.trim() || null,
        estado: editForm.estado,
      });
      setUserEditar(null);
    } catch (err) {
      setEditError(err?.response?.data?.message || 'Error al guardar los cambios.');
    }
  };

  const handleAssignSubmit = async (e) => {
    e?.preventDefault?.();
    try {
      await assignRoles({ usuarioId: userRoles.id, roles: selectedCodigos });
      setUserRoles(null);
    } catch (err) {
      setAssignError(err?.response?.data?.message || 'Error al asignar roles.');
    }
  };

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


      {/* Modal para ver los datos y roles del usuario */}
      <AdminDialog
        open={Boolean(userDetalle)}
        onClose={() => setUserDetalle(null)}
        maxWidth="md"
        title="Detalle de Usuario"
        loading={userDetalleLoading}
        children={
          <>
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
          </>
        }
        actions={<Button onClick={() => setUserDetalle(null)} variant="outlined">Cerrar</Button>}
      >
      </AdminDialog>


      {/* Modal para editar datos del usuario */}
      <AdminDialog
        open={Boolean(userEditar)}
        onClose={() => setUserEditar(null)}
        onSubmit={handleEditSubmit}
        title="Editar usuario"
        icon={<PersonOutlineOutlinedIcon />}
        maxWidth="sm"
        loading={isEditingProfile}
        children={
          <>
            {editError && (
              <Typography color="error" variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                • {editError}
              </Typography>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Nombres"
                  value={editForm.nombres}
                  onChange={(e) => { setEditForm((p) => ({ ...p, nombres: e.target.value })); setEditError(''); }}
                  disabled={isEditingProfile}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Apellidos"
                  value={editForm.apellidos}
                  onChange={(e) => { setEditForm((p) => ({ ...p, apellidos: e.target.value })); setEditError(''); }}
                  disabled={isEditingProfile}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={editForm.telefono}
                  onChange={(e) => { setEditForm((p) => ({ ...p, telefono: e.target.value })); setEditError(''); }}
                  disabled={isEditingProfile}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Estado de la cuenta
                </Typography>
                <ToggleButtonGroup
                  value={editForm.estado}
                  exclusive
                  onChange={(_, val) => { if (val) setEditForm((p) => ({ ...p, estado: val })); }}
                  disabled={isEditingProfile}
                  fullWidth
                >
                  {ESTADO_OPTIONS.map((opt) => {
                    const color = ({ success: theme.palette.success.main, default: theme.palette.text.disabled, error: theme.palette.error.main })[opt.color];
                    const selected = editForm.estado === opt.value;
                    return (
                      <ToggleButton
                        key={opt.value}
                        value={opt.value}
                        sx={{
                          flexDirection: 'column',
                          gap: 0.25,
                          py: 1.25,
                          borderColor: selected ? `${color} !important` : undefined,
                          bgcolor: selected ? alpha(color, 0.1) : undefined,
                          '&:hover': { bgcolor: alpha(color, 0.07) },
                        }}
                      >
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, mb: 0.25 }} />
                        <Typography variant="caption" fontWeight={700} sx={{ color: selected ? color : 'text.primary', lineHeight: 1 }}>
                          {opt.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1 }}>
                          {opt.desc}
                        </Typography>
                      </ToggleButton>
                    );
                  })}
                </ToggleButtonGroup>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Tipo de documento"
                  value={editForm.tipo_documento}
                  onChange={(e) => { setEditForm((p) => ({ ...p, tipo_documento: e.target.value, documento_identidad: '' })); setEditError(''); }}
                  disabled={isEditingProfile}
                >
                  {TIPO_DOCUMENTO_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {(() => {
                  const docRules = DOC_RULES[editForm.tipo_documento] || DOC_RULES.DNI;
                  const handleDocumentoChange = (e) => {
                    let value = e.target.value;
                    if (docRules.onlyDigits) value = value.replace(/\D/g, '');
                    if (value.length > docRules.maxLength) value = value.slice(0, docRules.maxLength);
                    setEditForm((p) => ({ ...p, documento_identidad: value }));
                    setEditError('');
                  };
                  const docProgress = docRules.exactLength ? `${editForm.documento_identidad.length} / ${docRules.exactLength}` : `${editForm.documento_identidad.length} / ${docRules.maxLength}`;
                  return (
                    <TextField
                      fullWidth
                      label="N° de documento"
                      value={editForm.documento_identidad}
                      onChange={handleDocumentoChange}
                      disabled={isEditingProfile}
                      inputProps={{ maxLength: docRules.maxLength, inputMode: docRules.onlyDigits ? 'numeric' : 'text' }}
                      helperText={<Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}><span>{docRules.helper}</span><span>{docProgress}</span></Box>}
                    />
                  );
                })()}
              </Grid>
            </Grid>
          </>
        }
        actions={
          <>
            <Button variant="outlined" onClick={() => setUserEditar(null)} disabled={isEditingProfile}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={isEditingProfile}>
              {isEditingProfile ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
      </AdminDialog>


      {/* Modal para la asignación y revoque de roles al usuario */}
      <AdminDialog
        open={Boolean(userRoles)}
        onClose={() => setUserRoles(null)}
        onSubmit={handleAssignSubmit}
        title="Asignar roles"
        icon={<ManageAccountsOutlinedIcon />}
        maxWidth="xs"
        loading={isAssigningRoles}
        children={
          <>
            {assignError && (
              <Typography color="error" variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                • {assignError}
              </Typography>
            )}

            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Selecciona los roles para <strong>{userRoles?.nombre_completo || userRoles?.email}</strong>.
              Los roles no seleccionados serán removidos.
            </Typography>

            {roleOptionsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {roleOptions.map((rol, index) => (
                  <Box key={rol.codigo}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedCodigos.includes(rol.codigo)}
                          onChange={() => handleToggleRole(rol.codigo)}
                          disabled={isAssigningRoles}
                          size="small"
                        />
                      }
                      label={<Box sx={{ py: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>{rol.nombre}</Typography>
                        {rol.descripcion && <Typography variant="caption" color="text.secondary">{rol.descripcion}</Typography>}
                      </Box>}
                      sx={{ mx: 0, py: 0.5 }}
                    />
                    {index < roleOptions.length - 1 && <Divider sx={{ borderStyle: 'dashed', opacity: 0.5 }} />}
                  </Box>
                ))}
              </Box>
            )}
          </>
        }
        actions={
          <>
            <Button variant="outlined" onClick={() => setUserRoles(null)} disabled={isAssigningRoles}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={isAssigningRoles || roleOptionsLoading}>
              {isAssigningRoles ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
      </AdminDialog>
    </PlaceholderPage>
  );
};
