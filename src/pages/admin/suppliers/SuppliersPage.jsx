// Página administrativa: Proveedores.
// Base para abastecimiento de productos bajo pedido o reposición de inventario.

import { useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, TextField } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useResourceTable } from '../../../hooks/admin/useResourceTable';

const initialForm = { id: '', ruc: '', razon_social: '', contacto: '', telefono: '', correo: '', direccion: '', notas: '', es_activo: true };

export const SuppliersPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ es_activo: '' });
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const { rows, pagination, loading, fetching, error, saving, save, patch } = useResourceTable({
    queryKey: ['suppliers-admin'],
    table: 'proveedores',
    pageNumber,
    pageSize,
    search,
    searchColumns: ['ruc', 'razon_social', 'contacto', 'telefono', 'correo'],
    filters: filters.es_activo === '' ? {} : { es_activo: `eq.${filters.es_activo}` },
    order: 'razon_social.asc',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.razon_social.trim()) {
      setFormError('Ingresa la razón social o nombre del proveedor.');
      return;
    }
    try {
      await save({ ...form, ruc: form.ruc || null, contacto: form.contacto || null, telefono: form.telefono || null, correo: form.correo || null, direccion: form.direccion || null, notas: form.notas || null });
      setNotice(form.id ? 'Proveedor actualizado.' : 'Proveedor registrado.');
      setFormOpen(false);
      setForm(initialForm);
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message);
    }
  };

  return (
    <PlaceholderPage title="Proveedores" description="Registra proveedores para compras, abastecimiento y productos bajo pedido.">
      <Stack spacing={2}>
        <ErrorMessage message={error || formError} />
        {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}
        <AdminResourceTable
          rows={rows}
          columns={[
            { field: 'ruc', headerName: 'RUC', width: 120, emptyText: '-' },
            { field: 'razon_social', headerName: 'Proveedor', width: 230 },
            { field: 'contacto', headerName: 'Contacto', width: 160, emptyText: '-' },
            { field: 'telefono', headerName: 'Teléfono', width: 140, emptyText: '-' },
            { field: 'correo', headerName: 'Correo', width: 210, emptyText: '-' },
            { field: 'es_activo', headerName: 'Activo', width: 110, type: 'boolean' },
          ]}
          actions={[
            { type: 'edit', label: 'Editar', onClick: (row) => { setForm({ ...initialForm, ...row }); setFormError(''); setFormOpen(true); } },
            { type: 'deactivate', label: 'Desactivar', visible: (row) => row.es_activo, onClick: async (row) => { await patch(row.id, { es_activo: false }); setNotice('Proveedor desactivado.'); } },
          ]}
          loading={loading || fetching || saving}
          pagination={pagination}
          searchValue={search}
          searchLabel="Buscar proveedor"
          filters={[{ name: 'es_activo', label: 'Estado', type: 'select', width: 160, options: [{ value: 'true', label: 'Activos' }, { value: 'false', label: 'Inactivos' }] }]}
          filterValues={filters}
          onSearchChange={(value) => { setSearch(value); setPageNumber(1); }}
          onFilterChange={(name, value) => { setFilters((current) => ({ ...current, [name]: value })); setPageNumber(1); }}
          onResetFilters={() => { setSearch(''); setFilters({ es_activo: '' }); setPageNumber(1); }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }}
          primaryActionLabel="Agregar proveedor"
          onPrimaryAction={() => { setForm(initialForm); setFormError(''); setFormOpen(true); }}
          emptyTitle="Sin proveedores"
          emptyDescription="Agrega proveedores para controlar abastecimiento."
        />
      </Stack>
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ pr: 6 }}>{form.id ? 'Editar proveedor' : 'Nuevo proveedor'}<IconButton onClick={() => setFormOpen(false)} size="small" sx={{ position: 'absolute', right: 8, top: 8 }}><CloseRoundedIcon fontSize="small" /></IconButton></DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <ErrorMessage message={formError} />
              <TextField label="RUC" value={form.ruc} onChange={(e) => setForm((c) => ({ ...c, ruc: e.target.value }))} />
              <TextField required label="Razón social / Nombre" value={form.razon_social} onChange={(e) => setForm((c) => ({ ...c, razon_social: e.target.value }))} />
              <TextField label="Contacto" value={form.contacto} onChange={(e) => setForm((c) => ({ ...c, contacto: e.target.value }))} />
              <TextField label="Teléfono" value={form.telefono} onChange={(e) => setForm((c) => ({ ...c, telefono: e.target.value }))} />
              <TextField label="Correo" type="email" value={form.correo} onChange={(e) => setForm((c) => ({ ...c, correo: e.target.value }))} />
              <TextField label="Dirección" value={form.direccion} onChange={(e) => setForm((c) => ({ ...c, direccion: e.target.value }))} />
              <TextField select label="Estado" value={String(form.es_activo)} onChange={(e) => setForm((c) => ({ ...c, es_activo: e.target.value === 'true' }))}><MenuItem value="true">Activo</MenuItem><MenuItem value="false">Inactivo</MenuItem></TextField>
              <TextField multiline minRows={3} label="Notas" value={form.notas} onChange={(e) => setForm((c) => ({ ...c, notas: e.target.value }))} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}><Button variant="outlined" onClick={() => setFormOpen(false)}>Cancelar</Button><Button type="submit" variant="contained" disabled={saving || !form.razon_social.trim()}>Guardar</Button></DialogActions>
        </Box>
      </Dialog>
    </PlaceholderPage>
  );
};
