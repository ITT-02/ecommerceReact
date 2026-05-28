// Utilidades para selección moderna de variantes en tienda.
// Detectan la variante por combinación dinámica de atributos.
// No dependen del nombre de la variante ni de valores fijos como Rojo/Kraft/Mate.

const normalizeText = (value) => String(value || '').trim().toLowerCase();

export const isVariantActive = (variant) => variant?.es_activa !== false;

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;

  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return null;

  return Number.isInteger(numberValue)
    ? String(numberValue)
    : String(numberValue).replace(/\.?0+$/, '');
};

export const getVariantMeasureLabel = (variant) => {
  if (!variant) return '';

  if (variant.etiqueta_medida) return String(variant.etiqueta_medida).trim();
  if (variant.medida) return String(variant.medida).trim();

  const largo = formatNumber(variant.medida_largo);
  const ancho = formatNumber(variant.medida_ancho);
  const alto = formatNumber(variant.medida_alto);
  const parts = [largo, ancho, alto].filter(Boolean);

  return parts.length ? parts.join('x') : '';
};

export const getAttributeName = (attribute) => {
  return (
    attribute?.atributo_nombre ||
    attribute?.nombre ||
    attribute?.atributo ||
    'Atributo'
  );
};

export const getAttributeCode = (attribute) => {
  return (
    attribute?.atributo_codigo ||
    attribute?.codigo ||
    normalizeText(getAttributeName(attribute))
  );
};

export const getAttributeGroupKey = (attribute) => {
  return attribute?.atributo_id || getAttributeCode(attribute);
};

export const getAttributeValueKey = (attribute) => {
  return attribute?.atributo_valor_id || attribute?.valor_slug || attribute?.valor;
};

export const isMeasureGroup = (group) => {
  const code = normalizeText(group?.atributo_codigo || group?.codigo);
  const name = normalizeText(group?.atributo_nombre || group?.nombre);

  return (
    code.includes('medida') ||
    code.includes('tamano') ||
    code.includes('tamaño') ||
    code.includes('dimension') ||
    name.includes('medida') ||
    name.includes('tamaño') ||
    name.includes('dimension')
  );
};

export const isColorGroup = (group) => {
  const code = normalizeText(group?.atributo_codigo || group?.codigo);
  const name = normalizeText(group?.atributo_nombre || group?.nombre);

  return code.includes('color') || name.includes('color');
};

const getGroupOrder = (attribute) => {
  if (attribute?.atributo_orden_visual !== undefined) {
    return Number(attribute.atributo_orden_visual);
  }

  if (attribute?.orden_grupo !== undefined) {
    return Number(attribute.orden_grupo);
  }

  // La medida virtual se prioriza porque viene desde producto_variantes,
  // no desde el CRUD de atributos.
  if (attribute?.es_virtual && getAttributeCode(attribute) === 'medida') {
    return 1;
  }

  return 99;
};

const buildVirtualMeasureAttribute = (variant) => {
  const measureLabel = getVariantMeasureLabel(variant);

  if (!measureLabel) return null;

  return {
    atributo_id: '__medida__',
    atributo_codigo: 'medida',
    atributo_nombre: 'Medida',
    atributo_valor_id: `medida:${measureLabel}`,
    valor: measureLabel,
    valor_slug: normalizeText(measureLabel).replace(/\s+/g, '-'),
    color_hex: null,
    orden_visual: 1,
    atributo_orden_visual: 1,
    es_virtual: true,
  };
};

export const getVariantAttributes = (
  variant,
  { includeVirtualMeasure = true } = {}
) => {
  const attributes = Array.isArray(variant?.atributos) ? [...variant.atributos] : [];

  if (!includeVirtualMeasure) return attributes;

  const alreadyHasMeasure = attributes.some((attribute) => {
    const code = normalizeText(getAttributeCode(attribute));
    const name = normalizeText(getAttributeName(attribute));

    return (
      code.includes('medida') ||
      code.includes('tamano') ||
      code.includes('tamaño') ||
      code.includes('dimension') ||
      name.includes('medida') ||
      name.includes('tamaño') ||
      name.includes('dimension')
    );
  });

  if (!alreadyHasMeasure) {
    const measureAttribute = buildVirtualMeasureAttribute(variant);
    if (measureAttribute) attributes.push(measureAttribute);
  }

  return attributes;
};

export const getVariantLabel = (variant) => {
  return (
    variant?.nombre_variante ||
    variant?.etiqueta_medida ||
    getVariantMeasureLabel(variant) ||
    variant?.codigoproducto ||
    variant?.codigoProducto ||
    'Variante'
  );
};

export const buildAttributeGroupsFromVariants = (variants = []) => {
  const groupsMap = new Map();

  variants.filter(isVariantActive).forEach((variant) => {
    getVariantAttributes(variant).forEach((attribute) => {
      const groupKey = getAttributeGroupKey(attribute);
      const valueKey = getAttributeValueKey(attribute);

      if (!groupKey || !valueKey) return;

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          key: groupKey,
          atributo_id: attribute.atributo_id,
          atributo_codigo: getAttributeCode(attribute),
          atributo_nombre: getAttributeName(attribute),
          orden_grupo: getGroupOrder(attribute),
          optionsMap: new Map(),
        });
      }

      const group = groupsMap.get(groupKey);

      if (!group.optionsMap.has(valueKey)) {
        group.optionsMap.set(valueKey, {
          key: valueKey,
          atributo_id: attribute.atributo_id,
          atributo_codigo: getAttributeCode(attribute),
          atributo_valor_id: attribute.atributo_valor_id,
          valor: attribute.valor,
          valor_slug: attribute.valor_slug,
          color_hex: attribute.color_hex,
          orden_visual: attribute.orden_visual ?? 999,
          es_virtual: Boolean(attribute.es_virtual),
        });
      }
    });
  });

  return Array.from(groupsMap.values())
    .map((group) => ({
      key: group.key,
      atributo_id: group.atributo_id,
      atributo_codigo: group.atributo_codigo,
      atributo_nombre: group.atributo_nombre,
      orden_grupo: group.orden_grupo,
      options: Array.from(group.optionsMap.values()).sort((a, b) => {
        const orderA = Number(a.orden_visual ?? 999);
        const orderB = Number(b.orden_visual ?? 999);

        if (orderA !== orderB) return orderA - orderB;
        return String(a.valor || '').localeCompare(String(b.valor || ''), 'es');
      }),
    }))
    .sort((a, b) => {
      const orderA = Number(a.orden_grupo ?? 99);
      const orderB = Number(b.orden_grupo ?? 99);

      if (orderA !== orderB) return orderA - orderB;
      return String(a.atributo_nombre || '').localeCompare(String(b.atributo_nombre || ''), 'es');
    });
};

export const getSelectableAttributeGroups = (groups = []) => {
  return groups.filter((group) => group.options.length > 1);
};

export const getFixedAttributeGroups = (groups = []) => {
  return groups.filter((group) => group.options.length === 1);
};

export const getSelectionFromVariant = (variant) => {
  const selection = {};

  getVariantAttributes(variant).forEach((attribute) => {
    const groupKey = getAttributeGroupKey(attribute);
    const valueKey = getAttributeValueKey(attribute);

    if (groupKey && valueKey) selection[groupKey] = valueKey;
  });

  return selection;
};

export const variantMatchesSelection = (variant, selection = {}) => {
  const attributes = getVariantAttributes(variant);
  const selectedEntries = Object.entries(selection).filter(([, value]) => Boolean(value));

  return selectedEntries.every(([groupKey, selectedValue]) => {
    return attributes.some((attribute) => {
      return (
        getAttributeGroupKey(attribute) === groupKey &&
        getAttributeValueKey(attribute) === selectedValue
      );
    });
  });
};

export const findVariantBySelection = (
  variants = [],
  selection = {},
  requiredGroups = []
) => {
  const hasAllRequiredGroups = requiredGroups.every((group) => Boolean(selection[group.key]));

  if (!hasAllRequiredGroups) return null;

  return (
    variants
      .filter(isVariantActive)
      .find((variant) => variantMatchesSelection(variant, selection)) || null
  );
};

export const getDefaultVariant = (variants = []) => {
  const activeVariants = variants.filter(isVariantActive);

  return (
    activeVariants.find((variant) => variant.es_predeterminada) ||
    activeVariants[0] ||
    null
  );
};

export const isOptionAvailableForSelection = ({
  variants = [],
  currentSelection = {},
  groupKey,
  optionValue,
}) => {
  const nextSelection = { ...currentSelection, [groupKey]: optionValue };

  return variants
    .filter(isVariantActive)
    .some((variant) => variantMatchesSelection(variant, nextSelection));
};

export const toggleOptionInSelection = ({
  currentSelection = {},
  groupKey,
  optionValue,
}) => {
  const nextSelection = { ...currentSelection };

  if (nextSelection[groupKey] === optionValue) {
    delete nextSelection[groupKey];
    return nextSelection;
  }

  nextSelection[groupKey] = optionValue;
  return nextSelection;
};

export const clearSelection = () => ({});
