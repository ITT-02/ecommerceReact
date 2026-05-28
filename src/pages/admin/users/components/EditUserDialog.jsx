import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  alpha,
} from '@mui/material';

const TIPO_DOCUMENTO_OPTIONS = [
  { value: 'DNI', label: 'DNI' },
  { value: 'RUC', label: 'RUC' },
  { value: 'CE', label: 'CE' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

const ESTADO_OPTIONS = [
  { value: 'activo',   label: 'Activo',   color: 'success', desc: 'Opera con normalidad' },
  { value: 'inactivo', label: 'Inactivo', color: 'default', desc: 'Deshabilitado' },
  { value: 'bloqueado',label: 'Bloqueado',color: 'error',   desc: 'Restringido' },
];

// Reglas por tipo de documento
const DOC_RULES = {
  DNI:       { maxLength: 8,  exactLength: 8,  onlyDigits: true,  helper: '8 dígitos numéricos' },
  RUC:       { maxLength: 11, exactLength: 11, onlyDigits: true,  helper: '11 dígitos numéricos' },
  CE:        { maxLength: 12, exactLength: null, onlyDigits: false, helper: 'Máx. 12 caracteres alfanuméricos' },
  PASAPORTE: { maxLength: 20, exactLength: null, onlyDigits: false, helper: 'Máx. 20 caracteres alfanuméricos' },
};

const initialForm = {
  nombres: '',
  apellidos: '',
  telefono: '',
  tipo_documento: 'DNI',
  documento_identidad: '',
  estado: 'activo',
};

export const EditUserDialog = ({ open, usuario, isSaving, onClose, onConfirm }) => {
  const theme = useTheme();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && usuario) {
      setForm({
        nombres: usuario.nombres || '',
        apellidos: usuario.apellidos || '',
        telefono: usuario.telefono || '',
        tipo_documento: usuario.tipo_documento || 'DNI',
        documento_identidad: usuario.documento_identidad || '',
        estado: usuario.estado || 'activo',
      });
      setError('');
    }
  }, [open, usuario]);

  if (!usuario) return null;

  const docRules = DOC_RULES[form.tipo_documento] || DOC_RULES.DNI;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleTipoDocumentoChange = (e) => {
    setForm((prev) => ({ ...prev, tipo_documento: e.target.value, documento_identidad: '' }));
    setError('');
  };

  const handleDocumentoChange = (e) => {
    let value = e.target.value;
    if (docRules.onlyDigits) value = value.replace(/\D/g, '');
    if (value.length > docRules.maxLength) value = value.slice(0, docRules.maxLength);
    setForm((prev) => ({ ...prev, documento_identidad: value }));
    setError('');
  };

  const validateDocumento = () => {
    const doc = form.documento_identidad.trim();
    if (!doc) return null; // campo opcional
    if (docRules.onlyDigits && !/^\d+$/.test(doc)) return `El ${form.tipo_documento} solo acepta dígitos numéricos.`;
    if (docRules.exactLength && doc.length !== docRules.exactLength)
      return `El ${form.tipo_documento} debe tener exactamente ${docRules.exactLength} dígitos.`;
    if (doc.length > docRules.maxLength)
      return `El ${form.tipo_documento} no puede superar ${docRules.maxLength} caracteres.`;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombres.trim()) { setError('El campo Nombres es obligatorio.'); return; }
    if (!form.apellidos.trim()) { setError('El campo Apellidos es obligatorio.'); return; }
    const docError = validateDocumento();
    if (docError) { setError(docError); return; }

    try {
      await onConfirm({
        usuarioId: usuario.id,
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        telefono: form.telefono.trim() || null,
        tipoDocumento: form.tipo_documento,
        documentoIdentidad: form.documento_identidad.trim() || null,
        estado: form.estado,
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al guardar los cambios.');
    }
  };

  const docProgress = docRules.exactLength
    ? `${form.documento_identidad.length} / ${docRules.exactLength}`
    : `${form.documento_identidad.length} / ${docRules.maxLength}`;

  const getEstadoColor = (colorKey) => ({
    success: theme.palette.success.main,
    default: theme.palette.text.disabled,
    error: theme.palette.error.main,
  }[colorKey] || theme.palette.text.secondary);

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 800 }}>Editar Perfil de Usuario</DialogTitle>

        <DialogContent dividers>
          {error && (
            <Typography color="error" variant="body2" fontWeight={600} sx={{ mb: 2 }}>
              • {error}
            </Typography>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Nombres"
                value={form.nombres}
                onChange={handleChange('nombres')}
                disabled={isSaving}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Apellidos"
                value={form.apellidos}
                onChange={handleChange('apellidos')}
                disabled={isSaving}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={form.telefono}
                onChange={handleChange('telefono')}
                disabled={isSaving}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Estado de la cuenta
              </Typography>
              <ToggleButtonGroup
                value={form.estado}
                exclusive
                onChange={(_, val) => { if (val) setForm((p) => ({ ...p, estado: val })); }}
                disabled={isSaving}
                fullWidth
              >
                {ESTADO_OPTIONS.map((opt) => {
                  const color = getEstadoColor(opt.color);
                  const selected = form.estado === opt.value;
                  return (
                    <ToggleButton
                      key={opt.value}
                      value={opt.value}
                      sx={{
                        flexDirection: 'column',
                        gap: 0.25,
                        py: 1.25,
                        borderColor: selected ? `${color} !important` : undefined,
                        bgcolor: selected ? alpha(color, 0.1) : undefined,
                        '&:hover': { bgcolor: alpha(color, 0.07) },
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: color,
                          mb: 0.25,
                        }}
                      />
                      <Typography variant="caption" fontWeight={700} sx={{ color: selected ? color : 'text.primary', lineHeight: 1 }}>
                        {opt.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1 }}>
                        {opt.desc}
                      </Typography>
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Tipo de documento"
                value={form.tipo_documento}
                onChange={handleTipoDocumentoChange}
                disabled={isSaving}
              >
                {TIPO_DOCUMENTO_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="N° de documento"
                value={form.documento_identidad}
                onChange={handleDocumentoChange}
                disabled={isSaving}
                slotProps={{
                  htmlInput: {
                    maxLength: docRules.maxLength,
                    inputMode: docRules.onlyDigits ? 'numeric' : 'text',
                  },
                }}
                helperText={
                  <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{docRules.helper}</span>
                    <span>{docProgress}</span>
                  </Box>
                }
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSaving} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSaving} disableElevation>
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
