import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid, MenuItem, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import { TextFieldController } from '../../../../components/forms/TextFieldController';
import { SelectFieldController } from '../../../../components/forms/SelectFieldController';
import { useStoreProfile } from '../../../../hooks/store/useStoreProfile';

const buildInitialProfileForm = (initialData) => ({
  nombres: initialData?.nombres || '',
  apellidos: initialData?.apellidos || '',
  telefono: initialData?.telefono || '',
  tipo_documento: initialData?.tipo_documento || 'DNI',
  documento_identidad: initialData?.documento_identidad || '',
});

const validateProfileForm = (formData) => {
  const errors = {};

  if (!formData.nombres.trim()) {
    errors.nombres = 'Los nombres son obligatorios';
  }

  if (!formData.apellidos.trim()) {
    errors.apellidos = 'Los apellidos son obligatorios';
  }

  if (!formData.telefono.trim()) {
    errors.telefono = 'El teléfono es obligatorio';
  } else if (!/^[0-9]+$/.test(formData.telefono)) {
    errors.telefono = 'El teléfono solo debe contener números';
  } else if (formData.telefono.length < 6) {
    errors.telefono = 'Debe tener al menos 6 dígitos';
  } else if (formData.telefono.length > 12) {
    errors.telefono = 'No puede exceder los 12 dígitos';
  }

  if (!formData.documento_identidad.trim()) {
    errors.documento_identidad = 'El documento es obligatorio';
  } else if (
    formData.tipo_documento === 'DNI' &&
    !/^[0-9]{8}$/.test(formData.documento_identidad)
  ) {
    errors.documento_identidad = 'El DNI debe tener exactamente 8 números';
  } else if (
    formData.tipo_documento === 'RUC' &&
    !/^[0-9]{11}$/.test(formData.documento_identidad)
  ) {
    errors.documento_identidad = 'El RUC debe tener exactamente 11 números';
  } else if (
    ['CE', 'PASAPORTE'].includes(formData.tipo_documento) &&
    !/^[A-Za-z0-9]{6,12}$/.test(formData.documento_identidad)
  ) {
    errors.documento_identidad = 'Entre 6 y 12 caracteres alfanuméricos';
  }

  return errors;
};

export const ProfileForm = ({ initialData }) => {
  const { updateProfile, isUpdatingProfile } = useStoreProfile();

  const initialFormData = useMemo(
    () => buildInitialProfileForm(initialData),
    [initialData]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [touchedFields, setTouchedFields] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    setFormData(initialFormData);
    setTouchedFields({});
    setSubmitAttempted(false);
  }, [initialFormData]);

  const errors = useMemo(() => validateProfileForm(formData), [formData]);

  const isValid = Object.keys(errors).length === 0;

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  const getFieldError = (fieldName) => {
    const shouldShowError = touchedFields[fieldName] || submitAttempted;
    return shouldShowError ? errors[fieldName] : '';
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setTouchedFields((currentTouched) => ({
      ...currentTouched,
      [name]: true,
    }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;

    setTouchedFields((currentTouched) => ({
      ...currentTouched,
      [name]: true,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitAttempted(true);

    if (!isValid) return;

    try {
      await updateProfile({
        p_nombres: formData.nombres.trim(),
        p_apellidos: formData.apellidos.trim(),
        p_telefono: formData.telefono.trim(),
        p_tipo_documento: formData.tipo_documento,
        p_documento_identidad: formData.documento_identidad.trim(),
      });
    } catch (error) {
      console.error('Error al actualizar el perfil', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Correo Electrónico
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {initialData?.email}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Nombre Completo Registrado
            </Typography>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {initialData?.nombre_completo}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Estado de Cuenta
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ textTransform: 'uppercase' }}
            >
              {initialData?.estado}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldController
            name="nombres"
            label="Nombres"
            value={formData.nombres}
            onChange={handleChange}
            onBlur={handleBlur}
            errorText={getFieldError('nombres')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldController
            name="apellidos"
            label="Apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            onBlur={handleBlur}
            errorText={getFieldError('apellidos')}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextFieldController
            name="telefono"
            label="Teléfono de Contacto"
            value={formData.telefono}
            onChange={handleChange}
            onBlur={handleBlur}
            errorText={getFieldError('telefono')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <SelectFieldController
            name="tipo_documento"
            label="Tipo Doc."
            value={formData.tipo_documento}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <MenuItem value="DNI">DNI</MenuItem>
            <MenuItem value="RUC">RUC</MenuItem>
            <MenuItem value="CE">CE</MenuItem>
            <MenuItem value="PASAPORTE">Pasaporte</MenuItem>
          </SelectFieldController>
        </Grid>

        <Grid size={{ xs: 12, sm: 8 }}>
          <TextFieldController
            name="documento_identidad"
            label="Número de Documento"
            value={formData.documento_identidad}
            onChange={handleChange}
            onBlur={handleBlur}
            errorText={getFieldError('documento_identidad')}
          />
        </Grid>
      </Grid>

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