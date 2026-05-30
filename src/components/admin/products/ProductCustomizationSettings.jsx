// Configuración de personalización por producto.
// Permite asignar opciones globales como logo, texto, archivo o acabados.

import {
  Alert,
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import { formatCurrency } from '../../../utils/formatters';

const getRuleByOptionId = (rules = [], optionId) =>
  rules.find((rule) => rule.opcion_id === optionId || rule.id === optionId);

const normalizeRule = (option, currentRule = {}) => ({
  id: currentRule.id || null,
  opcion_id: option.id,
  codigo: option.codigo,
  nombre: option.nombre,
  tipo_campo: option.tipo_campo,
  acepta_archivo: Boolean(option.acepta_archivo),
  es_obligatorio: Boolean(currentRule.es_obligatorio),
  permite_archivo: currentRule.permite_archivo ?? Boolean(option.acepta_archivo || option.tipo_campo === 'archivo'),
  archivo_obligatorio: Boolean(currentRule.archivo_obligatorio),
  requiere_cotizacion: currentRule.requiere_cotizacion ?? true,
  precio_adicional: currentRule.precio_adicional ?? '',
  texto_ayuda: currentRule.texto_ayuda || option.descripcion || '',
  orden_visual: currentRule.orden_visual ?? option.orden_visual ?? 0,
  es_activo: currentRule.es_activo ?? true,
});

export const ProductCustomizationSettings = ({
  enabled = false,
  options = [],
  selectedRules = [],
  loading = false,
  onChange,
}) => {
  const activeRules = selectedRules || [];

  const updateRules = (nextRules) => {
    onChange?.(nextRules);
  };

  const handleToggleOption = (option, checked) => {
    const exists = getRuleByOptionId(activeRules, option.id);

    if (checked && !exists) {
      updateRules([...activeRules, normalizeRule(option)]);
      return;
    }

    if (!checked) {
      updateRules(activeRules.filter((rule) => rule.opcion_id !== option.id));
    }
  };

  const handleRuleChange = (option, field, value) => {
    const currentRule = getRuleByOptionId(activeRules, option.id);
    const safeRule = normalizeRule(option, currentRule);

    updateRules(
      activeRules.map((rule) =>
        rule.opcion_id === option.id
          ? { ...safeRule, ...rule, [field]: value }
          : rule
      )
    );
  };

  if (!enabled) {
    return (
      <Alert severity="info">
        Asigna las opciones que este producto permite personalizar.
      </Alert>
    );
  }

  if (loading) {
    return <Alert severity="info">Cargando opciones de personalización...</Alert>;
  }

  if (!options.length) {
    return (
      <Alert severity="warning">
        Primero crea opciones globales en Catálogo comercial → Opciones de personalización.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        La variante conserva el precio base. Las opciones agregan costos referenciales para responder la cotización.
      </Alert>

      {options.map((option) => {
        const rule = getRuleByOptionId(activeRules, option.id);
        const isSelected = Boolean(rule);
        const safeRule = normalizeRule(option, rule || {});

        return (
          <Box
            key={option.id}
            sx={{
              border: '1px solid',
              borderColor: isSelected ? 'primary.main' : 'divider',
              borderRadius: 1,
              p: 2,
              bgcolor: isSelected ? 'action.hover' : 'background.paper',
            }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => handleToggleOption(option, event.target.checked)}
                    />
                  }
                  label={
                    <Stack spacing={0.25}>
                      <Typography variant="subtitle2" fontWeight={900}>
                        {option.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.descripcion || 'Sin descripción'}
                      </Typography>
                    </Stack>
                  }
                />

                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  <Chip size="small" label={option.tipo_campo} variant="outlined" />
                  {option.acepta_archivo && <Chip size="small" label="Acepta archivo" color="primary" variant="outlined" />}
                </Stack>
              </Stack>

              {isSelected && (
                <>
                  <Divider />
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(safeRule.es_obligatorio)}
                            onChange={(event) => handleRuleChange(option, 'es_obligatorio', event.target.checked)}
                          />
                        }
                        label="Obligatorio"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(safeRule.permite_archivo)}
                            onChange={(event) => handleRuleChange(option, 'permite_archivo', event.target.checked)}
                          />
                        }
                        label="Permite archivo"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(safeRule.archivo_obligatorio)}
                            disabled={!safeRule.permite_archivo}
                            onChange={(event) => handleRuleChange(option, 'archivo_obligatorio', event.target.checked)}
                          />
                        }
                        label="Archivo obligatorio"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(safeRule.requiere_cotizacion)}
                            onChange={(event) => handleRuleChange(option, 'requiere_cotizacion', event.target.checked)}
                          />
                        }
                        label="Requiere cotización"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <TextField
                        label="Precio adicional"
                        type="number"
                        size="small"
                        value={safeRule.precio_adicional}
                        onChange={(event) => handleRuleChange(option, 'precio_adicional', event.target.value)}
                        helperText={safeRule.precio_adicional ? `Ref.: ${formatCurrency(safeRule.precio_adicional)}` : 'Opcional'}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <TextField
                        label="Orden"
                        type="number"
                        size="small"
                        value={safeRule.orden_visual}
                        onChange={(event) => handleRuleChange(option, 'orden_visual', Number(event.target.value || 0))}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Texto de ayuda para cliente"
                        size="small"
                        value={safeRule.texto_ayuda}
                        onChange={(event) => handleRuleChange(option, 'texto_ayuda', event.target.value)}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
};
