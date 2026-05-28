import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';

/**
 * Modal reutilizable para crear y editar opciones de personalización.
 * Mantiene el formulario fuera de la página principal para mejorar mantenimiento.
 */
export const CustomizationOptionDialog = ({
  open,
  formData,
  formError,
  saving,
  fieldTypes,
  onClose,
  onChange,
  onBooleanChange,
  onSubmit,
}) => {
  const isEditing = Boolean(formData.id);

  const fieldTypeValue = fieldTypes.some(
    (type) => type.value === formData.tipo_campo,
  )
    ? formData.tipo_campo
    : '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {isEditing ? 'Editar opción' : 'Nueva opción de personalización'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack
          component="form"
          id="customization-option-form"
          spacing={2}
          onSubmit={onSubmit}
          sx={{ pt: 1 }}
        >
          {formError && (
            <Alert severity="error">
              {formError}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="nombre"
                label="Nombre visible"
                value={formData.nombre}
                onChange={onChange}
                fullWidth
                required
                disabled={saving}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="codigo"
                label="Código interno"
                value={formData.codigo}
                onChange={onChange}
                fullWidth
                required
                disabled={saving}
                helperText="Se genera automáticamente desde el nombre, pero puedes ajustarlo."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                name="tipo_campo"
                label="Tipo de campo"
                value={fieldTypeValue}
                onChange={onChange}
                fullWidth
                disabled={saving}
              >
                {fieldTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                name="orden_visual"
                label="Orden visual"
                type="number"
                value={formData.orden_visual}
                onChange={onChange}
                fullWidth
                disabled={saving}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Stack
                spacing={1}
                sx={{
                  height: '100%',
                  justifyContent: 'center',
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(formData.es_activo)}
                      onChange={(event) =>
                        onBooleanChange('es_activo', event.target.checked)
                      }
                      disabled={saving}
                    />
                  }
                  label={formData.es_activo ? 'Activa' : 'Inactiva'}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(formData.acepta_archivo)}
                    onChange={(event) =>
                      onBooleanChange(
                        'acepta_archivo',
                        event.target.checked,
                      )
                    }
                    disabled={saving}
                  />
                }
                label={
                  formData.acepta_archivo
                    ? 'Esta opción permite adjuntar archivo'
                    : 'Esta opción no requiere archivo'
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                name="descripcion"
                label="Descripción / ayuda interna"
                value={formData.descripcion}
                onChange={onChange}
                multiline
                minRows={2}
                fullWidth
                disabled={saving}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                name="opcionesTexto"
                label="Opciones para listas desplegables"
                value={formData.opcionesTexto}
                onChange={onChange}
                multiline
                minRows={3}
                fullWidth
                disabled={saving}
                helperText="Una opción por línea. Solo se usa cuando el tipo de campo es Lista de opciones."
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>

        <Button
          type="submit"
          form="customization-option-form"
          variant="contained"
          startIcon={<AddCircleOutlineRoundedIcon />}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar opción'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};