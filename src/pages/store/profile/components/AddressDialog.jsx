import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, Box, FormControlLabel, Switch, Typography
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

import { TextFieldController } from '../../../../components/forms/TextFieldController';
import { useMyProfile } from '../../../../hooks/store/useMyProfile';

export const AddressDialog = ({ open, onClose, address, isFirstAddress }) => {
  const { createAddress, updateAddress } = useMyProfile();
  
  const isEdit = Boolean(address); // Si nos pasan address, es Modo Edición

  const { control, handleSubmit, reset, formState: { isValid, isSubmitting } } = useForm({
    mode: 'onChange'
  });

  // Efecto para rellenar o limpiar el formulario cada vez que se abre el modal
  useEffect(() => {
    if (open) {
      if (isEdit) {
        reset({
          alias: address.alias || '',
          destinatario: address.destinatario || '',
          telefono: address.telefono || '',
          departamento: address.departamento || '',
          provincia: address.provincia || '',
          distrito: address.distrito || '',
          direccion_linea: address.direccion_linea || '',
          referencia: address.referencia || '',
          codigo_postal: address.codigo_postal || '',
          es_principal: address.es_principal || false
        });
      } else {
        // Modo Crear
        reset({
          alias: '',
          destinatario: '',
          telefono: '',
          departamento: '',
          provincia: '',
          distrito: '',
          direccion_linea: '',
          referencia: '',
          codigo_postal: '',
          // Si es su primera dirección registrada, la marcamos como principal por defecto
          es_principal: isFirstAddress ? true : false, 
        });
      }
    }
  }, [open, isEdit, address, isFirstAddress, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        p_alias: data.alias,
        p_destinatario: data.destinatario,
        p_telefono: data.telefono,
        p_departamento: data.departamento,
        p_provincia: data.provincia,
        p_distrito: data.distrito,
        p_direccion_linea: data.direccion_linea,
        p_referencia: data.referencia,
        p_codigo_postal: data.codigo_postal,
        p_es_principal: data.es_principal
      };

      if (isEdit) {
        await updateAddress({ p_direccion_id: address.id, ...payload });
      } else {
        await createAddress(payload);
      }
      onClose(); // Cierra el modal exitosamente
    } catch (error) {
      console.error('Error procesando la dirección', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {isEdit ? 'Editar Dirección' : 'Nueva Dirección'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldController
                name="alias"
                control={control}
                label="Alias (Ej. Casa, Trabajo)"
              />
            </Grid>

            {/* Switch para marcar como principal */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Controller
                  name="es_principal"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <FormControlLabel
                      control={<Switch checked={value} onChange={onChange} color="primary" />}
                      label={
                        <Typography variant="body2" fontWeight={600}>
                          {isEdit && value ? 'Es la principal' : 'Usar como principal'}
                        </Typography>
                      }
                    />
                  )}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextFieldController
                name="destinatario"
                control={control}
                label="Persona que recibe el pedido"
                rules={{ required: 'El destinatario es obligatorio' }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldController
                name="telefono"
                control={control}
                label="Teléfono de contacto"
                rules={{ 
                  required: 'El teléfono es obligatorio',
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Solo se permiten números'
                  },
                  minLength: { value: 6, message: 'Debe tener al menos 6 dígitos' },
                  maxLength: { value: 12, message: 'No puede exceder los 12 dígitos' }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldController
                name="codigo_postal"
                control={control}
                label="Código Postal (Opcional)"
                rules={{ 
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Solo se permiten números'
                  },
                  maxLength: { value: 6, message: 'Máximo 6 dígitos' }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextFieldController
                name="departamento"
                control={control}
                label="Departamento"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextFieldController
                name="provincia"
                control={control}
                label="Provincia"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextFieldController
                name="distrito"
                control={control}
                label="Distrito"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextFieldController
                name="direccion_linea"
                control={control}
                label="Dirección Exacta (Calle, Nro, Urb)"
                multiline
                rows={2}
                rules={{ required: 'La dirección exacta es obligatoria' }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextFieldController
                name="referencia"
                control={control}
                label="Referencia de Ubicación"
                multiline
                rows={2}
              />
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || isSubmitting}
            disableElevation
          >
            {isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Guardar')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddressDialog;