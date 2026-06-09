// Selector moderno de opciones de variante para tienda.
// Muestra como botones solo las opciones que realmente varían.
// Las características fijas o de la variante seleccionada se muestran como información.

import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import {
  getFixedAttributeGroups,
  getSelectableAttributeGroups,
  getVariantAttributes,
  getVariantLabel,
  isColorGroup,
  isMeasureGroup,
  isOptionAvailableForSelection,
} from '../../utils/store/variantSelection';

const getVariantTotalAvailable = (variant) => {
  const stock = Number(variant?.stock_total ?? variant?.stock_actual ?? 0);
  const external = Math.max(
    0,
    Number(variant?.stock_externo_restante ?? 0)
      || (Number(variant?.stock_externo_disponible ?? 0) - Number(variant?.stock_externo_reservado ?? 0))
      || 0
  );
  return stock + external;
};

const getStockLabel = (variant, product) => {
  if (!variant) return 'Selecciona una combinación';
  if ((variant.tipo_stock_operativo || '') === 'stock_socio_limitado') {
    const total = getVariantTotalAvailable(variant);
    return total > 0 ? `Disponible hasta ${total}` : 'Sin disponibilidad';
  }
  if ((variant.stock_total ?? variant.stock_actual ?? 0) > 0) return 'Disponible';
  if (product?.vender_sin_stock) return 'Bajo pedido';
  return 'Sin stock';
};

const getStockColor = (variant, product) => {
  if (!variant) return 'default';
  if ((variant.tipo_stock_operativo || '') === 'stock_socio_limitado') return getVariantTotalAvailable(variant) > 0 ? 'success' : 'default';
  if ((variant.stock_total ?? variant.stock_actual ?? 0) > 0) return 'success';
  if (product?.vender_sin_stock) return 'warning';
  return 'default';
};

const VariantOptionButton = ({ group, option, selected, available, onClick }) => {
  const isMeasure = isMeasureGroup(group);
  const isColor = isColorGroup(group);

  if (isMeasure) {
    return (
      <Button
        type="button"
        variant={selected ? 'contained' : 'outlined'}
        disabled={!available}
        onClick={onClick}
        sx={{
          minWidth: { xs: 'calc(50% - 8px)', sm: 150 },
          minHeight: 72,
          borderRadius: 2.5,
          textTransform: 'none',
          justifyContent: 'flex-start',
          px: 2,
          py: 1.25,
        }}
      >
        <Stack spacing={0.25} sx={{ alignItems: 'flex-start' }}>
          <Typography variant="body2" fontWeight={800}>
            {option.valor}
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: selected ? 'inherit' : 'text.secondary' }}
          >
            {selected ? 'Seleccionado' : 'Medida'}
          </Typography>
        </Stack>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={selected ? 'contained' : 'outlined'}
      disabled={!available}
      onClick={onClick}
      sx={{
        minHeight: 42,
        borderRadius: 999,
        textTransform: 'none',
        px: isColor ? 1.25 : 1.6,
        gap: 0.75,
      }}
    >
      {isColor && option.color_hex && (
        <Box
          component="span"
          sx={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            bgcolor: option.color_hex,
            border: '1px solid',
            borderColor: selected ? 'primary.contrastText' : 'divider',
            boxShadow: 1,
          }}
        />
      )}

      <Box component="span">{option.valor}</Box>

      {selected && <CheckRoundedIcon sx={{ fontSize: 16 }} />}
    </Button>
  );
};

export const ProductVariantOptions = ({
  product,
  variants = [],
  attributeGroups = [],
  selectedOptions = {},
  selectedVariant = null,
  onToggleOption,
  onClearSelection,
  onSelectVariantFallback,
  showFixedGroups = true,
  showSelectedVariantFeatures = true,
}) => {
  const selectableGroups = getSelectableAttributeGroups(attributeGroups);
  const fixedGroups = getFixedAttributeGroups(attributeGroups);
  const selectedVariantAttributes = getVariantAttributes(selectedVariant);

  if (!variants.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Este producto aún no tiene variantes disponibles.
      </Typography>
    );
  }

  if (!attributeGroups.length) {
    return (
      <Stack spacing={1.25}>
        <Typography variant="subtitle2" fontWeight={800}>
          Selecciona una opción
        </Typography>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          {variants.map((variant) => {
            const selected = selectedVariant?.id === variant.id;

            return (
              <Button
                key={variant.id}
                type="button"
                variant={selected ? 'contained' : 'outlined'}
                onClick={() => onSelectVariantFallback?.(variant)}
                sx={{
                  minHeight: 44,
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 1.5,
                }}
              >
                {getVariantLabel(variant)}
              </Button>
            );
          })}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.25}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="subtitle2" fontWeight={900}>
          Opciones del producto
        </Typography>

        {Object.keys(selectedOptions).length > 0 && (
          <Button
            type="button"
            size="small"
            variant="text"
            startIcon={<RestartAltRoundedIcon fontSize="small" />}
            onClick={onClearSelection}
            sx={{ textTransform: 'none' }}
          >
            Limpiar
          </Button>
        )}
      </Stack>

      {selectableGroups.map((group) => {
        const groupKey = group.key;
        const selectedValue = selectedOptions[groupKey];
        const isMeasure = isMeasureGroup(group);

        return (
          <Box key={groupKey}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
              {group.atributo_nombre}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              {group.options.map((option) => {
                const selected = selectedValue === option.key;

                const available = isOptionAvailableForSelection({
                  variants,
                  currentSelection: selectedOptions,
                  groupKey,
                  optionValue: option.key,
                });

                return (
                  <VariantOptionButton
                    key={option.key}
                    group={group}
                    option={option}
                    selected={selected}
                    available={available}
                    onClick={() => onToggleOption?.(group, option)}
                  />
                );
              })}
            </Stack>

            {isMeasure && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.75 }}
              >
                Elige una medida para ver las opciones compatibles.
              </Typography>
            )}
          </Box>
        );
      })}

      {showFixedGroups && fixedGroups.length > 0 && (
        <Box>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
            Características generales
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            {fixedGroups.map((group) => (
              <Chip
                key={group.key}
                size="small"
                variant="outlined"
                label={`${group.atributo_nombre}: ${group.options[0]?.valor || '-'}`}
              />
            ))}
          </Stack>
        </Box>
      )}

      {selectedVariant ? (
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            <Chip
              size="small"
              label={getStockLabel(selectedVariant, product)}
              color={getStockColor(selectedVariant, product)}
              variant="outlined"
            />

            {selectedVariant.codigoproducto && (
              <Chip
                size="small"
                label={`SKU: ${selectedVariant.codigoproducto}`}
                variant="outlined"
              />
            )}
          </Stack>

          {showSelectedVariantFeatures && selectedVariantAttributes.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                Características de la opción seleccionada
              </Typography>

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                {selectedVariantAttributes.map((attribute) => (
                  <Chip
                    key={`${attribute.atributo_id || attribute.atributo_codigo}-${attribute.atributo_valor_id || attribute.valor}`}
                    size="small"
                    variant="outlined"
                    label={`${attribute.atributo_nombre}: ${attribute.valor}`}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      ) : (
        <Typography variant="body2" color="warning.main">
          Selecciona una combinación disponible para continuar.
        </Typography>
      )}
    </Stack>
  );
};
