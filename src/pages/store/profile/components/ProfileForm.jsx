import React from 'react';
import { Box, Button, Grid, MenuItem, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import SaveIcon from '@mui/icons-material/Save';

import { TextFieldController }   from '../../../../components/forms/TextFieldController';
import { SelectFieldController } from '../../../../components/forms/SelectFieldController';
import { useMyProfile }          from '../../../../hooks/store/useMyProfile';

export const ProfileForm = ({ initialData }) => {
  const { updateProfile, isUpdatingProfile } = useMyProfile();

  const { control, handleSubmit, watch, formState: { isDirty, isValid } } = useForm({
    defaultValues: {
      nombres:             initialData?.nombres             || '',
      apellidos:           initialData?.apellidos           || '',
      telefono:            initialData?.telefono            || '',
      tipo_documento:      initialData?.tipo_documento      || 'DNI',
      documento_identidad: initialData?.documento_identidad || '',
    },
    mode: 'onChange', // Valida en tiempo real
  });

  // Espiamos el tipo de documento para aplicar reglas condicionales
  const tipoDoc = watch('tipo_documento');

  const onSubmit = async (data) => {
    try {
      await updateProfile({
        p_nombres:             data.nombres,
        p_apellidos:           data.apellidos,
        p_telefono:            data.telefono,
        p_tipo_documento:      data.tipo_documento,
        p_documento_identidad: data.documento_identidad,
      });
    } catch (error) {
      console.error('Error al actualizar el perfil', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>

      {/* ── Campos de solo lectura (Info de Seguridad) ───────────────────── */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">Correo Electrónico</Typography>
            <Typography variant="body2" fontWeight={600}>{initialData?.email}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">Nombre Completo Registrado</Typography>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {initialData?.nombre_completo}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">Estado de Cuenta</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'uppercase' }}>
              {initialData?.estado}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* ── Campos Editables ─────────────────────────── */}
      <Grid container spacing={2}>
        
        {/* Nombres */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldController
            name="nombres"
            control={control}
            label="Nombres"
            rules={{ required: 'Los nombres son obligatorios' }}
          />
        </Grid>
        
        {/* Apellidos */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldController
            name="apellidos"
            control={control}
            label="Apellidos"
            rules={{ required: 'Los apellidos son obligatorios' }}
          />
        </Grid>

        {/* Teléfono */}
        <Grid size={{ xs: 12 }}>
          <TextFieldController
            name="telefono"
            control={control}
            label="Teléfono de Contacto"
            rules={{
              required: 'El teléfono es obligatorio',
              pattern: {
                value: /^[0-9]+$/,
                message: 'El teléfono solo debe contener números'
              },
              minLength: { value: 6,  message: 'Debe tener al menos 6 dígitos' },
              maxLength: { value: 12, message: 'No puede exceder los 12 dígitos' }
            }}
          />
        </Grid>

        {/* Tipo de Documento */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <SelectFieldController
            name="tipo_documento"
            control={control}
            label="Tipo Doc."
          >
            <MenuItem value="DNI">DNI</MenuItem>
            <MenuItem value="RUC">RUC</MenuItem>
            <MenuItem value="CE">CE</MenuItem>
            <MenuItem value="PASAPORTE">Pasaporte</MenuItem>
          </SelectFieldController>
        </Grid>

        {/* Número de Documento */}
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextFieldController
            name="documento_identidad"
            control={control}
            label="Número de Documento"
            rules={{
              required: 'El documento es obligatorio',
              validate: (value) => {
                if (tipoDoc === 'DNI') {
                  return /^[0-9]{8}$/.test(value) || 'El DNI debe tener exactamente 8 números';
                }
                if (tipoDoc === 'RUC') {
                  return /^[0-9]{11}$/.test(value) || 'El RUC debe tener exactamente 11 números';
                }
                if (tipoDoc === 'CE' || tipoDoc === 'PASAPORTE') {
                  return /^[A-Za-z0-9]{6,12}$/.test(value) || 'Entre 6 y 12 caracteres alfanuméricos';
                }
                return true;
              }
            }}
          />
        </Grid>

      </Grid> {/* Fin Grid container */}

      {/* ── Acciones (Guardar) ───────────────────────────── */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!isDirty || !isValid || isUpdatingProfile}
          startIcon={<SaveIcon />}
        >
          {isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Box>

    </Box>
  );
};

export default ProfileForm;