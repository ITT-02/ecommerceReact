// Panel/modal de filtros avanzados del catálogo público.
// Se abre como drawer derecho para mantener la grilla limpia y parecida a un ecommerce moderno.

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import {
  AVAILABILITY_OPTIONS,
  DEFAULT_ORDER_VALUE,
  ORDER_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
} from './catalogFilterOptions';

const normalizeValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const getOptionLabel = (options, value) =>
  options.find((item) => normalizeValue(item.value) === normalizeValue(value))?.label || '';

const SelectFilterField = ({
  label,
  value,
  placeholder = 'Todos',
  options = [],
  onChange,
  showEmptyOption = true,
}) => {
  const normalizedValue = normalizeValue(value);
  const optionValues = options.map((option) => normalizeValue(option.value));

  const safeValue =
    normalizedValue && optionValues.includes(normalizedValue)
      ? normalizedValue
      : '';

  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={safeValue}
      onChange={(event) => onChange?.(event.target.value)}
      sx={(theme) => ({
        '& .MuiOutlinedInput-root': {
          borderRadius: theme.palette.custom.radius.xs,
          bgcolor: theme.palette.custom.semantic.storeMarketing.lightCardBg,
        },
      })}
    >
      {showEmptyOption && <MenuItem value="">{placeholder}</MenuItem>}

      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

const FilterAccordion = ({
  title,
  subtitle,
  defaultExpanded = false,
  children,
}) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    disableGutters
    elevation={0}
    sx={(theme) => ({
      border: `1px solid ${theme.palette.custom.semantic.storeMarketing.lightCardBorder}`,
      borderRadius: `${theme.palette.custom.radius.xs}px !important`,
      bgcolor: theme.palette.custom.semantic.storeMarketing.lightCardBg,
      overflow: 'hidden',
      '&::before': { display: 'none' },
      '& + &': { mt: 1 },
    })}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreRoundedIcon />}
      sx={{
        minHeight: 48,
        px: 1.5,
        '& .MuiAccordionSummary-content': {
          my: 0.8,
        },
      }}
    >
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 950,
            lineHeight: 1.15,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </AccordionSummary>

    <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 1.5 }}>
      {children}
    </AccordionDetails>
  </Accordion>
);

export const CatalogAdvancedFiltersDialog = ({
  open,
  values = {},
  activeCount = 0,
  selectedCategory,
  onClose,
  onChange,
  onClear,
}) => {
  const update = (name, value) => {
    onChange?.(name, value);
  };

  const currentOrderValue = values.orderBy || DEFAULT_ORDER_VALUE;

  const summaryItems = [
    selectedCategory && {
      key: 'categoria',
      label: selectedCategory.nombre,
    },
    values.tipoCompra && {
      key: 'tipoCompra',
      label: getOptionLabel(PRODUCT_TYPE_OPTIONS, values.tipoCompra),
    },
    values.disponibilidad && {
      key: 'disponibilidad',
      label: getOptionLabel(AVAILABILITY_OPTIONS, values.disponibilidad),
    },
    values.destacado && {
      key: 'destacado',
      label: 'Destacado',
    },
    values.personalizable && {
      key: 'personalizable',
      label: 'Personalizable',
    },
    values.precioMin && {
      key: 'precioMin',
      label: `Desde S/ ${values.precioMin}`,
    },
    values.precioMax && {
      key: 'precioMax',
      label: `Hasta S/ ${values.precioMax}`,
    },
  ].filter(Boolean);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      slotProps={{
        paper: {
          sx: (theme) => ({
            width: { xs: '100%', sm: 390 },
            maxWidth: '100vw',
            bgcolor: theme.palette.custom.semantic.storeMarketing.lightBg,
            backgroundImage: 'none',
            borderLeft: `1px solid ${theme.palette.custom.semantic.storeMarketing.lightCardBorder}`,
          }),
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={(theme) => ({
            px: 2,
            py: 1.5,
            bgcolor: theme.palette.custom.semantic.storeMarketing.lightCardBg,
            borderBottom: `1px solid ${theme.palette.custom.semantic.storeMarketing.lightCardBorder}`,
          })}
        >
          <Stack
            direction="row"
            spacing={1.2}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                minWidth: 0,
              }}
            >
              <Box
                sx={(theme) => ({
                  width: 34,
                  height: 34,
                  borderRadius: theme.palette.custom.radius.xs,
                  display: 'grid',
                  placeItems: 'center',
                  color: theme.palette.custom.semantic.storeMarketing.lightAccent,
                  bgcolor: theme.palette.custom.semantic.storeMarketing.accentSofter,
                  border: `1px solid ${theme.palette.custom.semantic.storeMarketing.lightCardBorder}`,
                })}
              >
                <TuneRoundedIcon fontSize="small" />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 950,
                    lineHeight: 1.1,
                  }}
                >
                  Filtros avanzados
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {activeCount > 0 ? `${activeCount} activo(s)` : 'Sin filtros activos'}
                </Typography>
              </Box>
            </Stack>

            <IconButton
              size="small"
              onClick={onClose}
              aria-label="Cerrar filtros avanzados"
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <Stack spacing={1.4}>
            {summaryItems.length > 0 && (
              <Stack
                direction="row"
                spacing={0.75}
                useFlexGap
                sx={{ flexWrap: 'wrap' }}
              >
                {summaryItems.map((item) => (
                  <Chip
                    key={item.key}
                    size="small"
                    color="primary"
                    variant="outlined"
                    label={item.label}
                  />
                ))}
              </Stack>
            )}

            <FilterAccordion
              title="Tipo de compra"
              subtitle={getOptionLabel(PRODUCT_TYPE_OPTIONS, values.tipoCompra) || 'Todos'}
              defaultExpanded
            >
              <SelectFilterField
                label="Tipo de compra"
                value={values.tipoCompra}
                placeholder="Todos"
                options={PRODUCT_TYPE_OPTIONS}
                onChange={(value) => update('tipoCompra', value)}
              />
            </FilterAccordion>

            <FilterAccordion
              title="Disponibilidad"
              subtitle={getOptionLabel(AVAILABILITY_OPTIONS, values.disponibilidad) || 'Todas'}
            >
              <SelectFilterField
                label="Disponibilidad"
                value={values.disponibilidad}
                placeholder="Todas"
                options={AVAILABILITY_OPTIONS}
                onChange={(value) => update('disponibilidad', value)}
              />
            </FilterAccordion>

            <FilterAccordion
              title="Características"
              subtitle="Destacado y personalizable"
              defaultExpanded
            >
              <Stack spacing={0.75}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.destacado === 'true'}
                      onChange={(event) =>
                        update('destacado', event.target.checked ? 'true' : '')
                      }
                    />
                  }
                  label="Solo destacados"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={values.personalizable === 'true'}
                      onChange={(event) =>
                        update('personalizable', event.target.checked ? 'true' : '')
                      }
                    />
                  }
                  label="Solo personalizables"
                />
              </Stack>
            </FilterAccordion>

            <FilterAccordion title="Precio" subtitle="Rango opcional">
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Precio mínimo"
                    type="number"
                    value={values.precioMin || ''}
                    onChange={(event) => update('precioMin', event.target.value)}
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        step: '0.01',
                      },
                    }}
                    sx={(theme) => ({
                      '& .MuiOutlinedInput-root': {
                        borderRadius: theme.palette.custom.radius.xs,
                        bgcolor: theme.palette.custom.semantic.storeMarketing.lightCardBg,
                      },
                    })}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Precio máximo"
                    type="number"
                    value={values.precioMax || ''}
                    onChange={(event) => update('precioMax', event.target.value)}
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        step: '0.01',
                      },
                    }}
                    sx={(theme) => ({
                      '& .MuiOutlinedInput-root': {
                        borderRadius: theme.palette.custom.radius.xs,
                        bgcolor: theme.palette.custom.semantic.storeMarketing.lightCardBg,
                      },
                    })}
                  />
                </Grid>
              </Grid>
            </FilterAccordion>

            <FilterAccordion
              title="Orden"
              subtitle={getOptionLabel(ORDER_OPTIONS, currentOrderValue) || 'Más recientes'}
            >
              <SelectFilterField
                label="Orden"
                value={currentOrderValue}
                options={ORDER_OPTIONS}
                showEmptyOption={false}
                onChange={(value) => update('orderBy', value || DEFAULT_ORDER_VALUE)}
              />
            </FilterAccordion>
          </Stack>
        </Box>

        <Box
          sx={(theme) => ({
            p: 2,
            bgcolor: theme.palette.custom.semantic.storeMarketing.lightCardBg,
            borderTop: `1px solid ${theme.palette.custom.semantic.storeMarketing.lightCardBorder}`,
          })}
        >
          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              startIcon={<RestartAltRoundedIcon />}
              onClick={onClear}
              variant="outlined"
              disabled={!activeCount}
            >
              Limpiar{activeCount > 0 ? ` (${activeCount})` : ''}
            </Button>

            <Button fullWidth onClick={onClose} variant="contained">
              Aplicar
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};