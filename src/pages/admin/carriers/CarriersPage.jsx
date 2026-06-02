// Página administrativa: Transportistas.
// Catálogo base de empresas externas de envío usadas en seguimiento.

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
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
    changingStatus,
    saveCarrier,
    toggleCarrierActive,
  } = useCarriers({
    pageNumber,
    pageSize,
    search,
    esActivo: filters.esActivo === '' ? null : filters.esActivo,
  });

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
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
      setFormError('Ingresa el nombre de la empresa transportista.');
      return;
    }

    try {
      await saveCarrier(form);
      setNotice(form.id ? 'Transportista actualizado correctamente.' : 'Transportista registrado correctamente.');
      setFormOpen(false);
      setForm(initialForm);
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message);
    }
  };

  const handleToggleStatus = async (carrier, nextValue) => {
    setNotice('');
    setFormError('');

    try {
      await toggleCarrierActive(carrier, nextValue);
      setNotice(nextValue ? 'Transportista activado.' : 'Transportista desactivado.');
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message);
    }
  };

  const columns = [
    { field: 'nombre', headerName: 'Transportista', width: 220 },
    { field: 'telefono', headerName: 'Teléfono', width: 145, emptyText: '-' },
    { field: 'correo', headerName: 'Correo', width: 210, emptyText: '-' },
    { field: 'url_rastreo_base', headerName: 'URL rastreo base', width: 280, emptyText: '-' },
    {
      field: 'es_activo',
      headerName: 'Estado',
      width: 135,
      renderCell: (carrier) => (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Switch
            size="small"
            checked={Boolean(carrier.es_activo)}
            disabled={saving || changingStatus}
            onChange={(event) => handleToggleStatus(carrier, event.target.checked)}
            slotProps={{
              input: {
                'aria-label': `Cambiar estado de ${carrier.nombre}`,
              },
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 800 }}>
            {carrier.es_activo ? 'Activo' : 'Inactivo'}
          </Typography>
        </Stack>
      ),
    },
  ];

  const actions = [
    { type: 'edit', label: 'Editar', onClick: openEditForm },
  ];

  return (
    <PlaceholderPage
      title="Transportistas"
      description="Administra las empresas externas que entregan los pedidos y sus datos de rastreo."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error || formError} />
        {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

        <AdminResourceTable
          rows={carriers}
          columns={columns}
          actions={actions}
          loading={loading || fetching || saving || changingStatus}
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
            setFilters((current) => ({ ...current, [name]: value }));
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
          primaryActionLabel="Agregar transportista"
          onPrimaryAction={openNewForm}
          emptyTitle="Sin transportistas"
          emptyDescription="Registra empresas de envío como Shalom, Olva, Marvisur o courier propio."
        />
      </Stack>

      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
        fullWidth
        maxWidth="sm"
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ pr: 6 }}>
            {form.id ? 'Editar transportista' : 'Nuevo transportista'}

            <IconButton
              onClick={handleCloseForm}
              disabled={saving}
              size="small"
              aria-label="Cerrar"
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              <ErrorMessage message={formError} />

              <TextField
                required
                label="Nombre"
                value={form.nombre}
                disabled={saving}
                onChange={(event) => updateField('nombre', event.target.value)}
              />

              <TextField
                label="Teléfono"
                value={form.telefono}
                disabled={saving}
                onChange={(event) => updateField('telefono', event.target.value)}
              />

              <TextField
                label="Correo"
                type="email"
                value={form.correo}
                disabled={saving}
                onChange={(event) => updateField('correo', event.target.value)}
              />

              <TextField
                label="URL rastreo base"
                type="url"
                value={form.url_rastreo_base}
                disabled={saving}
                helperText="Opcional. Puedes usar {tracking}, {numero} o {guia} para armar la URL automáticamente."
                onChange={(event) => updateField('url_rastreo_base', event.target.value)}
              />

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    Estado del transportista
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {form.es_activo
                      ? 'Activo para asignarlo en pedidos y envíos.'
                      : 'Inactivo para nuevas asignaciones.'}
                  </Typography>
                </Box>

                <Switch
                  checked={Boolean(form.es_activo)}
                  disabled={saving}
                  color="primary"
                  onChange={(event) => updateField('es_activo', event.target.checked)}
                  slotProps={{
                    input: {
                      'aria-label': 'Cambiar estado del transportista',
                    },
                  }}
                />
              </Box>

              <TextField
                multiline
                minRows={3}
                label="Notas"
                value={form.notas}
                disabled={saving}
                onChange={(event) => updateField('notas', event.target.value)}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" onClick={handleCloseForm} disabled={saving}>
              Cancelar
            </Button>

            <Button type="submit" variant="contained" disabled={saving || !form.nombre.trim()}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </PlaceholderPage>
  );
};
