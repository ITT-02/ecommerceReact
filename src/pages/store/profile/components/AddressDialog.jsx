import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';

import { TextFieldController } from '../../../../components/forms/TextFieldController';
import { useStoreProfile } from '../../../../hooks/store/useStoreProfile';

const buildInitialAddressForm = ({ address, isFirstAddress }) => {
  if (address) {
    return {
      alias: address.alias || '',
      destinatario: address.destinatario || '',
      telefono: address.telefono || '',
      departamento: address.departamento || '',
      provincia: address.provincia || '',
      distrito: address.distrito || '',
      direccion_linea: address.direccion_linea || '',
      referencia: address.referencia || '',
      codigo_postal: address.codigo_postal || '',
      es_principal: Boolean(address.es_principal),
    };
  }

  return {
    alias: '',
    destinatario: '',
    telefono: '',
    departamento: '',
    provincia: '',
    distrito: '',
    direccion_linea: '',
    referencia: '',
    codigo_postal: '',
    es_principal: Boolean(isFirstAddress),
  };
};

const validateAddressForm = (formData) => {
  const errors = {};

  if (!formData.destinatario.trim()) {
    errors.destinatario = 'El destinatario es obligatorio';
  }

  if (!formData.telefono.trim()) {
    errors.telefono = 'El teléfono es obligatorio';
  } else if (!/^[0-9]+$/.test(formData.telefono)) {
    errors.telefono = 'Solo se permiten números';
  } else if (formData.telefono.length < 6) {
    errors.telefono = 'Debe tener al menos 6 dígitos';
  } else if (formData.telefono.length > 12) {
    errors.telefono = 'No puede exceder los 12 dígitos';
  }

  if (
    formData.codigo_postal.trim() &&
    !/^[0-9]+$/.test(formData.codigo_postal)
  ) {
    errors.codigo_postal = 'Solo se permiten números';
  } else if (formData.codigo_postal.length > 6) {
    errors.codigo_postal = 'Máximo 6 dígitos';
  }

  if (!formData.direccion_linea.trim()) {
    errors.direccion_linea = 'La dirección exacta es obligatoria';
  }

  return errors;
};

export const AddressDialog = ({ open, onClose, address, isFirstAddress }) => {
  const { createAddress, updateAddress } = useStoreProfile();

  const isEdit = Boolean(address);

  const initialFormData = useMemo(
    () => buildInitialAddressForm({ address, isFirstAddress }),
    [address, isFirstAddress]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [touchedFields, setTouchedFields] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFormData(initialFormData);
    setTouchedFields({});
    setSubmitAttempted(false);
    setIsSubmitting(false);
  }, [open, initialFormData]);

  const errors = useMemo(() => validateAddressForm(formData), [formData]);

  const isValid = Object.keys(errors).length === 0;

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

  const handleMainAddressChange = (event) => {
    const { checked } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      es_principal: checked,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitAttempted(true);

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const payload = {
        p_alias: formData.alias.trim(),
        p_destinatario: formData.destinatario.trim(),
        p_telefono: formData.telefono.trim(),
        p_departamento: formData.departamento.trim(),
        p_provincia: formData.provincia.trim(),
        p_distrito: formData.distrito.trim(),
        p_direccion_linea: formData.direccion_linea.trim(),
        p_referencia: formData.referencia.trim(),
        p_codigo_postal: formData.codigo_postal.trim(),
        p_es_principal: formData.es_principal,
      };

      if (isEdit) {
        await updateAddress({
          p_direccion_id: address.id,
          ...payload,
        });
      } else {
        await createAddress(payload);
      }

      onClose();
    } catch (error) {
      console.error('Error procesando la dirección', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {isEdit ? 'Editar Dirección' : 'Nueva Dirección'}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldController
                name="alias"
                label="Alias (Ej. Casa, Trabajo)"
                value={formData.alias}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.es_principal}
                      onChange={handleMainAddressChange}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={600}>
                      {isEdit && formData.es_principal
                        ? 'Es la principal'
                        : 'Usar como principal'}
                    </Typography>
                  }
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextFieldController
                name="destinatario"
                label="Persona que recibe el pedido"
                value={formData.destinatario}
                onChange={handleChange}
                onBlur={handleBlur}
                errorText={getFieldError('destinatario')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldController
                name="telefono"
                label="Teléfono de contacto"
                value={formData.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                errorText={getFieldError('telefono')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldController
                name="codigo_postal"
                label="Código Postal (Opcional)"
                value={formData.codigo_postal}
                onChange={handleChange}
                onBlur={handleBlur}
                errorText={getFieldError('codigo_postal')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextFieldController
                name="departamento"
                label="Departamento"
                value={formData.departamento}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextFieldController
                name="provincia"
                label="Provincia"
                value={formData.provincia}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextFieldController
                name="distrito"
                label="Distrito"
                value={formData.distrito}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextFieldController
                name="direccion_linea"
                label="Dirección Exacta (Calle, Nro, Urb)"
                value={formData.direccion_linea}
                onChange={handleChange}
                onBlur={handleBlur}
                errorText={getFieldError('direccion_linea')}
                multiline
                rows={2}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextFieldController
                name="referencia"
                label="Referencia de Ubicación"
                value={formData.referencia}
                onChange={handleChange}
                onBlur={handleBlur}
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
            {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};