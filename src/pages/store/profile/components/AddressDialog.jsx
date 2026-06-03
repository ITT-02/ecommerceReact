import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Button,
  Grid,
  Box,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';

import { TextFieldController } from '../../../../components/forms/TextFieldController';
import { AddressLocationFields } from '../../../../components/common/location/AddressLocationFields';
import { useStoreProfile } from '../../../../hooks/store/useStoreProfile';

const DEFAULT_COUNTRY = 'PE';

const buildInitialAddressForm = ({ address, isFirstAddress }) => {
  const ubigeo = address?.ubigeo || '';

  if (address) {
    return {
      alias: address.alias || '',
      destinatario: address.destinatario || '',
      telefono: address.telefono || '',
      pais_codigo: address.pais_codigo || DEFAULT_COUNTRY,
      departamento_codigo: address.departamento_codigo || (ubigeo ? ubigeo.slice(0, 2) : ''),
      provincia_codigo: address.provincia_codigo || (ubigeo ? ubigeo.slice(0, 4) : ''),
      ubigeo,
      departamento: address.departamento || '',
      provincia: address.provincia || '',
      distrito: address.distrito || '',
      region_texto: address.region_texto || '',
      ciudad_texto: address.ciudad_texto || '',
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
    pais_codigo: DEFAULT_COUNTRY,
    departamento_codigo: '',
    provincia_codigo: '',
    ubigeo: '',
    departamento: '',
    provincia: '',
    distrito: '',
    region_texto: '',
    ciudad_texto: '',
    direccion_linea: '',
    referencia: '',
    codigo_postal: '',
    es_principal: Boolean(isFirstAddress),
  };
};

const validateAddressForm = (formData) => {
  const errors = {};
  const isPeru = (formData.pais_codigo || DEFAULT_COUNTRY) === 'PE';

  if (!formData.pais_codigo) {
    errors.pais_codigo = 'Seleccione un país';
  }

  if (isPeru && !formData.ubigeo) {
    errors.ubigeo = 'Seleccione departamento, provincia y distrito';
  }

  if (!isPeru && !formData.region_texto.trim()) {
    errors.region_texto = 'Ingrese región, estado o provincia';
  }

  if (!isPeru && !formData.ciudad_texto.trim()) {
    errors.ciudad_texto = 'Ingrese ciudad';
  }

  if (!formData.destinatario.trim()) {
    errors.destinatario = 'El destinatario es obligatorio';
  }

  if (!formData.telefono.trim()) {
    errors.telefono = 'El teléfono es obligatorio';
  } else if (!/^[0-9+\-\s()]+$/.test(formData.telefono)) {
    errors.telefono = 'Ingrese un teléfono válido';
  } else if (formData.telefono.replace(/\D/g, '').length < 6) {
    errors.telefono = 'Debe tener al menos 6 dígitos';
  } else if (formData.telefono.replace(/\D/g, '').length > 15) {
    errors.telefono = 'No puede exceder los 15 dígitos';
  }

  if (formData.codigo_postal.trim() && !/^[a-zA-Z0-9\-\s]{2,20}$/.test(formData.codigo_postal)) {
    errors.codigo_postal = 'Ingrese un código postal válido';
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
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;

    setFormData(initialFormData);
    setTouchedFields({});
    setSubmitAttempted(false);
    setIsSubmitting(false);
    setFormError('');
  }, [open, initialFormData]);

  const errors = useMemo(() => validateAddressForm(formData), [formData]);

  const isValid = Object.keys(errors).length === 0;

  const getFieldError = (fieldName) => {
    const shouldShowError = touchedFields[fieldName] || submitAttempted;
    return shouldShowError ? errors[fieldName] : '';
  };

  const handleDialogClose = () => {
    if (isSubmitting) return;
    onClose();
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

  const handleLocationChange = (nextLocation) => {
    setFormData((currentData) => ({
      ...currentData,
      ...nextLocation,
    }));

    setTouchedFields((currentTouched) => ({
      ...currentTouched,
      pais_codigo: true,
      ubigeo: true,
      region_texto: true,
      ciudad_texto: true,
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
    setFormError('');

    if (!isValid) return;

    const isPeru = (formData.pais_codigo || DEFAULT_COUNTRY) === 'PE';

    setIsSubmitting(true);

    try {
      const payload = {
        p_alias: formData.alias.trim(),
        p_destinatario: formData.destinatario.trim(),
        p_telefono: formData.telefono.trim(),
        p_pais_codigo: formData.pais_codigo || DEFAULT_COUNTRY,
        p_ubigeo: isPeru ? formData.ubigeo : null,
        p_departamento: isPeru ? formData.departamento : formData.region_texto.trim(),
        p_provincia: isPeru ? formData.provincia : null,
        p_distrito: isPeru ? formData.distrito : formData.ciudad_texto.trim(),
        p_region_texto: isPeru ? null : formData.region_texto.trim(),
        p_ciudad_texto: isPeru ? null : formData.ciudad_texto.trim(),
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
      setFormError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'No se pudo guardar la dirección. Revisa los datos e inténtalo nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="address-dialog-title"
    >
      <DialogTitle id="address-dialog-title" sx={{ fontWeight: 800 }}>
        {isEdit ? 'Editar dirección' : 'Nueva dirección'}
      </DialogTitle>

      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2}>
            {formError && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error" variant="outlined">
                  {formError}
                </Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldController
                name="alias"
                label="Alias (Ej. Casa, Trabajo)"
                value={formData.alias}
                onChange={handleChange}
                onBlur={handleBlur}
                size="small"
                disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={600}>
                      {isEdit && formData.es_principal ? 'Es la principal' : 'Usar como principal'}
                    </Typography>
                  }
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <AddressLocationFields
                value={formData}
                onChange={handleLocationChange}
                errors={{
                  pais_codigo: getFieldError('pais_codigo'),
                  ubigeo: getFieldError('ubigeo'),
                  region_texto: getFieldError('region_texto'),
                  ciudad_texto: getFieldError('ciudad_texto'),
                }}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextFieldController
                name="destinatario"
                label="Persona que recibe el pedido"
                value={formData.destinatario}
                onChange={handleChange}
                onBlur={handleBlur}
                errorText={getFieldError('destinatario')}
                size="small"
                disabled={isSubmitting}
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
                size="small"
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldController
                name="codigo_postal"
                label="Código postal (opcional)"
                value={formData.codigo_postal}
                onChange={handleChange}
                onBlur={handleBlur}
                errorText={getFieldError('codigo_postal')}
                size="small"
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextFieldController
                name="direccion_linea"
                label="Dirección exacta (calle, número, urbanización)"
                value={formData.direccion_linea}
                onChange={handleChange}
                onBlur={handleBlur}
                errorText={getFieldError('direccion_linea')}
                multiline
                rows={2}
                size="small"
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextFieldController
                name="referencia"
                label="Referencia de ubicación"
                value={formData.referencia}
                onChange={handleChange}
                onBlur={handleBlur}
                multiline
                rows={2}
                size="small"
                disabled={isSubmitting}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleDialogClose} color="inherit" disabled={isSubmitting}>
            Cancelar
          </Button>

          <Button type="submit" variant="contained" disabled={isSubmitting} disableElevation>
            {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};