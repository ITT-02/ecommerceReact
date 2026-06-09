import { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Grid, FormControlLabel, Switch } from '@mui/material';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import { AdminDialog } from '../../common/adminDialog/AdminDialog';
import { FileUploadField } from '../../common/Field/FileUploadField';

const TIPO_OPCIONES = [
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'billetera_digital', label: 'Billetera Digital' },
  { value: 'contra_entrega', label: 'Contra Entrega' },
  { value: 'otro', label: 'Otro' },
];

const INITIAL_STATE = {
  codigo: '',
  nombre: '',
  tipo: 'transferencia',
  moneda: 'PEN',
  titular: '',
  numero_cuenta: '',
  telefono: '',
  instrucciones: '',
  imagen_url: '',
  imagen_path: '',
  imageFile: null,
  orden_visual: 0,
  es_activo: true,
};

export const PaymentMethodFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState(INITIAL_STATE);

  useEffect(() => {
    if (open) {
      if (initialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          codigo: initialData.codigo || '',
          nombre: initialData.nombre || '',
          tipo: initialData.tipo || 'transferencia',
          moneda: initialData.moneda || 'PEN',
          titular: initialData.titular || '',
          numero_cuenta: initialData.numero_cuenta || '',
          telefono: initialData.telefono || '',
          instrucciones: initialData.instrucciones || '',
          imagen_url: initialData.imagen_url || '',
          imagen_path: initialData.imagen_path || '',
          imageFile: null,
          orden_visual: initialData.orden_visual !== undefined ? initialData.orden_visual : 0,
          es_activo: initialData.es_activo !== undefined ? initialData.es_activo : true,
        });
      } else {
        setFormData(INITIAL_STATE);
      }
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      orden_visual: Number(formData.orden_visual),
      titular: formData.titular || null,
      numero_cuenta: formData.numero_cuenta || null,
      telefono: formData.telefono || null,
      instrucciones: formData.instrucciones || null,
      imagen_url: formData.imagen_url || null,
      imagen_path: formData.imagen_path || null,
      imageFile: formData.imageFile || null,
    };
    onSubmit(payload);
  };

  const isEdit = !!initialData;

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar método de pago' : 'Nuevo método de pago'}
      icon={<PaymentRoundedIcon />}
      maxWidth="sm"
      loading={isSubmitting}
      onSubmit={handleSubmit}
      disableBackdropClick={isSubmitting}
      actions={
        <>
          <Button onClick={onClose} disabled={isSubmitting} variant="outlined" color="secondary">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </>
      }
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="codigo"
            label="Código"
            value={formData.codigo}
            onChange={handleChange}
            fullWidth
            required
            disabled={isEdit}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="nombre"
            label="Nombre visible"
            value={formData.nombre}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            name="tipo"
            label="Tipo"
            value={formData.tipo}
            onChange={handleChange}
            fullWidth
            required
          >
            {TIPO_OPCIONES.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="moneda"
            label="Moneda"
            value={formData.moneda}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            name="titular"
            label="Titular"
            value={formData.titular}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="numero_cuenta"
            label="N° de cuenta"
            value={formData.numero_cuenta}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="telefono"
            label="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            name="instrucciones"
            label="Instrucciones"
            value={formData.instrucciones}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FileUploadField
            label="Logotipo"
            accept="image/*"
            value={formData.imageFile}
            previewUrl={formData.imagen_url}
            height={160}
            onChange={(file) => setFormData((prev) => ({ ...prev, imageFile: file }))}
            onRemove={() =>
              setFormData((prev) => ({ ...prev, imageFile: null, imagen_url: '', imagen_path: '' }))
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="orden_visual"
            label="Orden visual"
            type="number"
            value={formData.orden_visual}
            onChange={handleChange}
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                name="es_activo"
                checked={formData.es_activo}
                onChange={handleChange}
                color="primary"
              />
            }
            label={formData.es_activo ? 'Activo' : 'Inactivo'}
          />
        </Grid>
      </Grid>
    </AdminDialog>
  );
};
