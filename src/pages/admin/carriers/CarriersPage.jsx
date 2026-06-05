import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { AdminDialog } from '../../../components/common/adminDialog/AdminDialog';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { StatusChip } from '../../../components/common/StatusChip';
import { useCarriers } from '../../../hooks/logistics/useShipments';

const initialForm = {
  id: '',
  nombre: '',
  telefono: '',
  correo: '',
  url_rastreo_base: '',
  notas: '',
  es_activo: true,
};

export const CarriersPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ esActivo: '' });
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const {
    carriers,
    pagination,
    loading,
    fetching,
    error,
    saving,
    saveCarrier,
  } = useCarriers({
    pageNumber,
    pageSize,
    search,
    esActivo: filters.esActivo === '' ? null : filters.esActivo,
  });

  const isEditing = Boolean(form.id);
  const disableSave = saving || !form.nombre.trim();

  const updateField = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError('');
  };

  const openNewForm = () => {
    setForm(initialForm);
    setFormError('');
    setNotice('');
    setFormOpen(true);
  };

  const openEditForm = (carrier) => {
    setForm({
      id: carrier.id || '',
      nombre: carrier.nombre || '',
      telefono: carrier.telefono || '',
      correo: carrier.correo || '',
      url_rastreo_base: carrier.url_rastreo_base || '',
      notas: carrier.notas || '',
      es_activo: carrier.es_activo ?? true,
    });

    setFormError('');
    setNotice('');
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    if (saving) return;

    setFormOpen(false);
    setForm(initialForm);
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.nombre.trim()) {
      setFormError('Nombre requerido.');
      return;
    }

    try {
      await saveCarrier(form);

      setNotice(isEditing ? 'Transportista actualizado.' : 'Transportista registrado.');
      setFormOpen(false);
      setForm(initialForm);
      setFormError('');
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          'No se pudo guardar.'
      );
    }
  };

  const columns = [
    {
      field: 'nombre',
      headerName: 'Transportista',
      width: 220,
    },
    {
      field: 'telefono',
      headerName: 'Teléfono',
      width: 145,
      emptyText: '-',
    },
    {
      field: 'correo',
      headerName: 'Correo',
      width: 210,
      emptyText: '-',
    },
    {
      field: 'url_rastreo_base',
      headerName: 'Rastreo',
      width: 260,
      emptyText: '-',
    },
    {
      field: 'es_activo',
      headerName: 'Estado',
      width: 120,
      renderCell: (carrier) => (
        <StatusChip
          label={carrier.es_activo ? 'Activo' : 'Inactivo'}
          color={carrier.es_activo ? 'success' : 'error'}
          variant="outlined"
          sx={{ fontWeight: 800 }}
        />
      ),
    },
  ];

  const actions = [
    {
      type: 'edit',
      label: 'Editar',
      onClick: openEditForm,
    },
  ];

  return (
    <PlaceholderPage title="Transportistas" description="Empresas de envío.">
      <Stack spacing={2}>
        <ErrorMessage message={error} />

        {notice && (
          <Alert severity="success" onClose={() => setNotice('')}>
            {notice}
          </Alert>
        )}

        <AdminResourceTable
          rows={carriers}
          columns={columns}
          actions={actions}
          loading={loading || fetching || saving}
          pagination={pagination}
          searchValue={search}
          searchLabel="Buscar transportista"
          filters={[
            {
              name: 'esActivo',
              label: 'Estado',
              type: 'select',
              width: 160,
              options: [
                { value: 'true', label: 'Activos' },
                { value: 'false', label: 'Inactivos' },
              ],
            },
          ]}
          filterValues={filters}
          onSearchChange={(value) => {
            setSearch(value);
            setPageNumber(1);
          }}
          onFilterChange={(name, value) => {
            setFilters((current) => ({
              ...current,
              [name]: value,
            }));

            setPageNumber(1);
          }}
          onResetFilters={() => {
            setSearch('');
            setFilters({ esActivo: '' });
            setPageNumber(1);
          }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPageNumber(1);
          }}
          primaryActionLabel="Nuevo transportista"
          onPrimaryAction={openNewForm}
          emptyTitle="Sin transportistas"
          emptyDescription="Aún no hay registros."
        />
      </Stack>

      <AdminDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        loading={saving}
        title={isEditing ? 'Editar transportista' : 'Nuevo transportista'}
        icon={<LocalShippingOutlinedIcon />}
        maxWidth="sm"
        actions={
          <>
            <Button variant="outlined" onClick={handleCloseForm} disabled={saving}>
              Cancelar
            </Button>

            <Button type="submit" variant="contained" disabled={disableSave}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
            },
            gap: 2,
            minWidth: 0,
          }}
        >
          <Box sx={{ gridColumn: '1 / -1' }}>
            <ErrorMessage message={formError} />
          </Box>

          <TextField
            required
            fullWidth
            label="Nombre"
            value={form.nombre}
            disabled={saving}
            sx={{ gridColumn: '1 / -1' }}
            onChange={(event) => updateField('nombre', event.target.value)}
          />

          <TextField
            fullWidth
            label="Teléfono"
            value={form.telefono}
            disabled={saving}
            onChange={(event) => updateField('telefono', event.target.value)}
          />

          <TextField
            fullWidth
            label="Correo"
            type="email"
            value={form.correo}
            disabled={saving}
            onChange={(event) => updateField('correo', event.target.value)}
          />

          <TextField
            fullWidth
            label="URL de rastreo"
            type="url"
            value={form.url_rastreo_base}
            disabled={saving}
            sx={{ gridColumn: '1 / -1' }}
            onChange={(event) => updateField('url_rastreo_base', event.target.value)}
          />

          <Box
            sx={(theme) => {
              const custom = theme.palette.custom || {};
              const semantic = custom.semantic || {};
              const dialog = semantic.adminDialog || {};
              const radius = custom.radius || {};

              return {
                gridColumn: '1 / -1',
                px: 2,
                py: 1.35,
                borderRadius: radius.xs || 1.5,
                border: '1px solid',
                borderColor: dialog.separator || theme.palette.divider,
                bgcolor: dialog.contentBg || theme.palette.background.paper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              };
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Estado
            </Typography>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                {form.es_activo ? 'Activo' : 'Inactivo'}
              </Typography>

              <Switch
                checked={Boolean(form.es_activo)}
                disabled={saving}
                color="primary"
                onChange={(event) => updateField('es_activo', event.target.checked)}
                slotProps={{
                  input: {
                    'aria-label': 'Cambiar estado',
                  },
                }}
              />
            </Stack>
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Notas"
            value={form.notas}
            disabled={saving}
            sx={{ gridColumn: '1 / -1' }}
            onChange={(event) => updateField('notas', event.target.value)}
          />
        </Box>
      </AdminDialog>
    </PlaceholderPage>
  );
};