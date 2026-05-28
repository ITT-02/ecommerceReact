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
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useCarriers } from '../../../hooks/logistics/useShipments';

const initialForm = {
  id: '',
  codigo: '',
  nombre: '',
  telefono: '',
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
    deactivateCarrier,
  } = useCarriers({
    pageNumber,
    pageSize,
    search,
    esActivo: filters.esActivo === '' ? null : filters.esActivo,
  });

  const openNewForm = () => {
    setForm(initialForm);
    setFormError('');
    setFormOpen(true);
  };

  const openEditForm = (carrier) => {
    setForm({
      id: carrier.id || '',
      codigo: carrier.codigo || '',
      nombre: carrier.nombre || '',
      telefono: carrier.telefono || '',
      url_rastreo_base: carrier.url_rastreo_base || '',
      notas: carrier.notas || '',
      es_activo: carrier.es_activo ?? true,
    });
    setFormError('');
    setFormOpen(true);
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

  const columns = [
    { field: 'codigo', headerName: 'Código', width: 120, emptyText: '-' },
    { field: 'nombre', headerName: 'Transportista', width: 220 },
    { field: 'telefono', headerName: 'Teléfono', width: 150, emptyText: '-' },
    { field: 'url_rastreo_base', headerName: 'URL rastreo base', width: 260, emptyText: '-' },
    { field: 'es_activo', headerName: 'Activo', width: 110, type: 'boolean' },
  ];

  const actions = [
    { type: 'edit', label: 'Editar', onClick: openEditForm },
    {
      type: 'deactivate',
      label: 'Desactivar',
      visible: (carrier) => carrier.es_activo,
      onClick: async (carrier) => {
        await deactivateCarrier(carrier);
        setNotice('Transportista desactivado.');
      },
    },
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
          onSearchChange={(value) => { setSearch(value); setPageNumber(1); }}
          onFilterChange={(name, value) => { setFilters((current) => ({ ...current, [name]: value })); setPageNumber(1); }}
          onResetFilters={() => { setSearch(''); setFilters({ esActivo: '' }); setPageNumber(1); }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }}
          primaryActionLabel="Agregar transportista"
          onPrimaryAction={openNewForm}
          emptyTitle="Sin transportistas"
          emptyDescription="Registra empresas de envío como Shalom, Olva, Marvisur o courier propio."
        />
      </Stack>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ pr: 6 }}>
            {form.id ? 'Editar transportista' : 'Nuevo transportista'}
            <IconButton
              onClick={() => setFormOpen(false)}
              disabled={saving}
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <ErrorMessage message={formError} />
              <TextField label="Código" value={form.codigo} onChange={(event) => setForm((current) => ({ ...current, codigo: event.target.value }))} />
              <TextField required label="Nombre" value={form.nombre} onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))} />
              <TextField label="Teléfono" value={form.telefono} onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))} />
              <TextField label="URL rastreo base" type="url" value={form.url_rastreo_base} onChange={(event) => setForm((current) => ({ ...current, url_rastreo_base: event.target.value }))} />
              <TextField select label="Estado" value={String(form.es_activo)} onChange={(event) => setForm((current) => ({ ...current, es_activo: event.target.value === 'true' }))}>
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
              </TextField>
              <TextField multiline minRows={3} label="Notas" value={form.notas} onChange={(event) => setForm((current) => ({ ...current, notas: event.target.value }))} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" onClick={() => setFormOpen(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving || !form.nombre.trim()}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </PlaceholderPage>
  );
};
