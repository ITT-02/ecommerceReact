// Filtros superiores del catálogo público.
// Producción: buscador debounced, filtros rápidos, carrusel de categorías e ingreso a filtros avanzados.

import { useMemo, useRef, useState } from 'react';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { CatalogAdvancedFiltersDialog } from './CatalogAdvancedFiltersDialog';
import { CategoryVisual } from './CategoryVisual';
import { HoverFilterMenu } from './HoverFilterMenu';
import {
  AVAILABILITY_OPTIONS,
  BOOLEAN_OPTIONS,
  ORDER_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  getFilterOptionLabel,
} from './catalogFilterOptions';

export { AVAILABILITY_OPTIONS, ORDER_OPTIONS, PRODUCT_TYPE_OPTIONS } from './catalogFilterOptions';

const ALL_VALUE = '';
const normalizeId = (value) => (value ? String(value) : '');

const sortCategories = (items = []) =>
  [...items].sort((a, b) => {
    const levelDiff = Number(a.nivel || 0) - Number(b.nivel || 0);
    if (levelDiff !== 0) return levelDiff;

    const orderDiff = Number(a.orden_visual || 0) - Number(b.orden_visual || 0);
    if (orderDiff !== 0) return orderDiff;

    return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
  });

const getTopCategories = (categories) => {
  const top = categories.filter((category) => !category.categoria_padre_id || Number(category.nivel || 0) === 0);
  return sortCategories(top.length ? top : categories);
};

const groupChildrenByParent = (categories) => {
  const map = new Map();

  categories.forEach((category) => {
    const parentId = normalizeId(category.categoria_padre_id);
    if (!parentId) return;
    if (!map.has(parentId)) map.set(parentId, []);
    map.get(parentId).push(category);
  });

  map.forEach((items, key) => map.set(key, sortCategories(items)));
  return map;
};

const findCategory = (categories, categoryId) => {
  const cleanId = normalizeId(categoryId);
  if (!cleanId) return null;
  return categories.find((category) => normalizeId(category.id) === cleanId) || null;
};

const getActiveFilterCount = ({ values, hasCategory = false }) => {
  const filters = [
    values.searchInput?.trim(),
    hasCategory,
    values.tipoCompra,
    values.disponibilidad,
    values.destacado,
    values.personalizable,
    values.precioMin,
    values.precioMax,
  ];

  return filters.filter(Boolean).length;
};

const CategoryButton = ({ category, selected, hasChildren, onEnter, onClick }) => {
  return (
    <Button
      onMouseEnter={hasChildren ? onEnter : undefined}
      onFocus={hasChildren ? onEnter : undefined}
      onClick={onClick}
      variant={selected ? 'contained' : 'outlined'}
      sx={(theme) => {
        const m = theme.palette.custom.semantic.storeMarketing;
        return {
          minWidth: { xs: 146, sm: 164 },
          maxWidth: { xs: 190, sm: 220 },
          height: 42,
          px: 1,
          justifyContent: 'flex-start',
          gap: 0.85,
          borderRadius: theme.palette.custom.radius.xs,
          textAlign: 'left',
          textTransform: 'none',
          flexShrink: 0,
          bgcolor: selected ? m.accent : m.lightCardBg,
          borderColor: selected ? m.accent : m.lightCardBorder,
          color: selected ? theme.palette.primary.contrastText : m.lightText,
          boxShadow: selected ? theme.palette.custom.shadows.sm : 'none',
          '&:hover': {
            bgcolor: selected ? m.accentHover : m.accentSofter,
            borderColor: m.accent,
            boxShadow: theme.palette.custom.shadows.sm,
          },
        };
      }}
    >
      <CategoryVisual category={category} size={28} />
      <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1, fontWeight: 850, lineHeight: 1.15 }}>
        {category.nombre}
      </Typography>
      {hasChildren && <KeyboardArrowRightRoundedIcon sx={{ fontSize: 17, opacity: 0.72 }} />}
    </Button>
  );
};

const SubcategoryPanel = ({ category, childrenCategories = [], selectedCategoryId, onSelect }) => {
  if (!category || !childrenCategories.length) return null;

  return (
    <Paper
      elevation={0}
      sx={(theme) => {
        const m = theme.palette.custom.semantic.storeMarketing;
        return {
          position: 'absolute',
          left: { xs: 0, md: 12 },
          top: 'calc(100% + 6px)',
          zIndex: theme.zIndex.modal,
          width: { xs: 'calc(100vw - 32px)', sm: 560, md: 660 },
          maxWidth: '100%',
          p: 1.25,
          borderRadius: theme.palette.custom.radius.xs,
          border: `1px solid ${m.lightCardBorder}`,
          bgcolor: m.lightCardBg,
          boxShadow: theme.palette.custom.shadows.lg,
        };
      }}
    >
      <Stack spacing={1.1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={0.85} sx={{ alignItems: 'center', minWidth: 0 }}>
            <CategoryVisual category={category} size={30} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 950, lineHeight: 1.15 }}>
                {category.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Selecciona una subcategoría
              </Typography>
            </Box>
          </Stack>

          <Button size="small" onClick={() => onSelect(category.id)} sx={{ textTransform: 'none', fontWeight: 850 }}>
            Toda la categoría
          </Button>
        </Stack>

        <Divider />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
            gap: 0.85,
          }}
        >
          {childrenCategories.map((child) => {
            const selected = normalizeId(selectedCategoryId) === normalizeId(child.id);

            return (
              <Button
                key={child.id}
                variant={selected ? 'contained' : 'outlined'}
                onClick={() => onSelect(child.id)}
                sx={(theme) => ({
                  height: 40,
                  px: 1,
                  justifyContent: 'flex-start',
                  gap: 0.8,
                  borderRadius: theme.palette.custom.radius.xs,
                  textTransform: 'none',
                })}
              >
                <CategoryVisual category={child} size={26} />
                <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1, fontWeight: 850, textAlign: 'left' }}>
                  {child.nombre}
                </Typography>
                {selected && <CheckRoundedIcon sx={{ fontSize: 17 }} />}
              </Button>
            );
          })}
        </Box>
      </Stack>
    </Paper>
  );
};

export const CatalogFilterPanel = ({ categories = [], values, onChange, onClear }) => {
  const [hoveredCategoryId, setHoveredCategoryId] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const closeTimerRef = useRef(null);

  const topCategories = useMemo(() => getTopCategories(categories), [categories]);
  const childrenByParent = useMemo(() => groupChildrenByParent(categories), [categories]);
  const selectedCategory = useMemo(() => findCategory(categories, values.categoriaId), [categories, values.categoriaId]);
  const hoveredCategory = useMemo(() => findCategory(categories, hoveredCategoryId), [categories, hoveredCategoryId]);
  const hoveredChildren = hoveredCategory ? childrenByParent.get(normalizeId(hoveredCategory.id)) || [] : [];
  const activeFilterCount = useMemo(() => getActiveFilterCount({ values, hasCategory: Boolean(selectedCategory) }), [selectedCategory, values]);

  const update = (name, value) => onChange?.(name, value);

  const openCategoryPanel = (categoryId) => {
    clearTimeout(closeTimerRef.current);
    setHoveredCategoryId(categoryId);
  };

  const scheduleCategoryPanelClose = () => {
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setHoveredCategoryId(''), 220);
  };

  const handleSelectCategory = (categoryId) => {
    const cleanId = normalizeId(categoryId);
    update('categoriaId', normalizeId(values.categoriaId) === cleanId ? ALL_VALUE : cleanId);
    setHoveredCategoryId('');
  };

  const activeChips = [
    selectedCategory && { key: 'categoria', label: selectedCategory.nombre, onDelete: () => update('categoriaId', ALL_VALUE) },
    values.searchInput?.trim() && { key: 'buscar', label: values.searchInput.trim(), onDelete: () => update('searchInput', '') },
    values.tipoCompra && { key: 'tipo', label: getFilterOptionLabel(PRODUCT_TYPE_OPTIONS, values.tipoCompra), onDelete: () => update('tipoCompra', '') },
    values.disponibilidad && { key: 'disponibilidad', label: getFilterOptionLabel(AVAILABILITY_OPTIONS, values.disponibilidad), onDelete: () => update('disponibilidad', '') },
    values.destacado && { key: 'destacado', label: `Destacado: ${getFilterOptionLabel(BOOLEAN_OPTIONS, values.destacado)}`, onDelete: () => update('destacado', '') },
    values.personalizable && { key: 'personalizable', label: `Personalizable: ${getFilterOptionLabel(BOOLEAN_OPTIONS, values.personalizable)}`, onDelete: () => update('personalizable', '') },
    values.precioMin && { key: 'precioMin', label: `Desde S/ ${values.precioMin}`, onDelete: () => update('precioMin', '') },
    values.precioMax && { key: 'precioMax', label: `Hasta S/ ${values.precioMax}`, onDelete: () => update('precioMax', '') },
  ].filter(Boolean);

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack spacing={1.2}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1}
          useFlexGap
          sx={{ alignItems: { lg: 'center' }, justifyContent: 'space-between' }}
        >
          <TextField
            size="small"
            label="Buscar producto, código o medida"
            placeholder="Ingrese nombre, código o medida"
            value={values.searchInput}
            onChange={(event) => update('searchInput', event.target.value)}
            sx={(theme) => ({
              width: { xs: '100%', lg: 420, xl: 500 },
              flexShrink: 0,
              '& .MuiOutlinedInput-root': {
                height: 44,
                borderRadius: theme.palette.custom.radius.xs,
                bgcolor: theme.palette.custom.semantic.storeMarketing.lightCardBg,
              },
            })}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
            <HoverFilterMenu label="Tipo de compra" value={values.tipoCompra} placeholder="Todos" options={PRODUCT_TYPE_OPTIONS} onChange={(value) => update('tipoCompra', value)} />
            <HoverFilterMenu label="Disponibilidad" value={values.disponibilidad} placeholder="Todas" options={AVAILABILITY_OPTIONS} onChange={(value) => update('disponibilidad', value)} />
            <HoverFilterMenu label="Orden" value={values.orderBy} placeholder="Más recientes" options={ORDER_OPTIONS} onChange={(value) => update('orderBy', value || 'recientes')} />

            <Badge color="primary" badgeContent={activeFilterCount} invisible={!activeFilterCount}>
              <Button
                startIcon={<TuneRoundedIcon />}
                variant="outlined"
                onClick={() => setAdvancedOpen(true)}
                sx={(theme) => ({
                  minHeight: 44,
                  borderRadius: theme.palette.custom.radius.xs,
                  textTransform: 'none',
                  fontWeight: 850,
                })}
              >
                Filtros avanzados
              </Button>
            </Badge>

            <Button
              startIcon={<RestartAltRoundedIcon />}
              variant="outlined"
              onClick={onClear}
              disabled={!activeFilterCount}
              sx={(theme) => ({
                minHeight: 44,
                borderRadius: theme.palette.custom.radius.xs,
                textTransform: 'none',
                fontWeight: 850,
              })}
            >
              Limpiar{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
          </Stack>
        </Stack>

        <Box
          onMouseLeave={scheduleCategoryPanelClose}
          onMouseEnter={() => clearTimeout(closeTimerRef.current)}
          sx={(theme) => ({
            position: 'relative',
            mx: { xs: -2, md: 0 },
            px: { xs: 2, md: 0 },
            py: 0.35,
            borderTop: `1px solid ${theme.palette.custom.semantic.storeMarketing.lightCardBorder}`,
            borderBottom: `1px solid ${theme.palette.custom.semantic.storeMarketing.lightCardBorder}`,
          })}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{
              overflowX: 'auto',
              overflowY: 'visible',
              scrollbarWidth: 'thin',
              py: 0.45,
              pr: 1,
            }}
          >
            <Button
              onClick={() => update('categoriaId', ALL_VALUE)}
              variant={!values.categoriaId ? 'contained' : 'outlined'}
              sx={(theme) => ({
                minWidth: 118,
                height: 42,
                borderRadius: theme.palette.custom.radius.xs,
                fontWeight: 900,
                textTransform: 'none',
                flexShrink: 0,
              })}
            >
              Ver todo
            </Button>

            {topCategories.map((category) => {
              const children = childrenByParent.get(normalizeId(category.id)) || [];
              return (
                <CategoryButton
                  key={category.id}
                  category={category}
                  selected={normalizeId(values.categoriaId) === normalizeId(category.id)}
                  hasChildren={children.length > 0}
                  onEnter={() => openCategoryPanel(category.id)}
                  onClick={() => handleSelectCategory(category.id)}
                />
              );
            })}
          </Stack>

          <SubcategoryPanel
            category={hoveredCategory}
            childrenCategories={hoveredChildren}
            selectedCategoryId={values.categoriaId}
            onSelect={handleSelectCategory}
          />
        </Box>

        {activeChips.length > 0 && (
          <Stack direction="row" spacing={0.8} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
            {activeChips.map((chip) => (
              <Chip key={chip.key} size="small" label={chip.label} onDelete={chip.onDelete} />
            ))}
          </Stack>
        )}
      </Stack>

      <CatalogAdvancedFiltersDialog
        open={advancedOpen}
        values={values}
        selectedCategory={selectedCategory}
        activeCount={activeFilterCount}
        onChange={update}
        onClear={onClear}
        onClose={() => setAdvancedOpen(false)}
      />
    </Box>
  );
};
