// Página administrativa: venta manual asistida.
// Permite registrar ventas directas o cotizaciones gestionadas por un vendedor.

import { useEffect, useMemo, useState } from 'react';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  CircularProgress,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { FileUploadField } from '../../../components/common/Field/FileUploadField';
import { PageHeader } from '../../../components/common/PageHeader';
import { useDebouncedValue } from '../../../hooks/common/useDebouncedValue';
import { useManualSale, useManualSaleProducts } from '../../../hooks/sales/useManualSale';
import { formatCurrency } from '../../../utils/formatters';

const initialClient = {
  cliente_tipo: 'mostrador',
  nombre_cliente: '',
  telefono_cliente: '',
  correo_cliente: '',
  documento_cliente: '',
  empresa_cliente: '',
  canal_atencion: 'presencial',
};

const initialDelivery = {
  tipo_entrega: 'recojo',
  nombre_receptor: '',
  telefono_receptor: '',
  departamento: '',
  provincia: '',
  distrito: '',
  direccion: '',
  referencia: '',
};

const initialPayment = {
  metodoPago: 'efectivo',
  estadoPago: 'pagado',
  referenciaTransaccion: '',
  comprobanteFile: null,
};

const CATALOG_PAGE_SIZE = 4;

const deliveryTypes = ['envio_domicilio', 'agencia'];
const contactDeliveryTypes = ['envio_domicilio', 'agencia', 'por_coordinar'];

const directSaleDeliveryOptions = [
  { value: 'recojo', label: 'Recojo en tienda' },
  { value: 'envio_domicilio', label: 'Envío a domicilio' },
  { value: 'agencia', label: 'Agencia o transportista' },
];

const quoteDeliveryOptions = [
  ...directSaleDeliveryOptions,
  { value: 'por_coordinar', label: 'Por coordinar' },
];

const getOptions = (product) => {
  if (Array.isArray(product?.personalizacion_opciones)) return product.personalizacion_opciones;

  try {
    return JSON.parse(product?.personalizacion_opciones || '[]');
  } catch {
    return [];
  }
};

const getAttributes = (product) => {
  if (Array.isArray(product?.atributos)) return product.atributos;

  try {
    return JSON.parse(product?.atributos || '[]');
  } catch {
    return [];
  }
};

const numberValue = (value) => Number(value || 0);
const positiveQuantity = (value) => Math.max(1, Number.parseInt(value || 1, 10));

const getAvailableStock = (item) => numberValue(
  item?.stock_disponible ?? item?.stock_actual ?? item?.stock_total
);

const getStockMinimum = (item) => numberValue(item?.stock_minimo);

const getOperationalStockType = (item) => item?.tipo_stock_operativo || item?.disponibilidad_tipo || 'inventario_aliqora';

const isPartnerLimitedStock = (item) => getOperationalStockType(item) === 'stock_socio_limitado'
  || (Boolean(item?.socio_comercial_id) && Number.isFinite(Number(item?.stock_externo_disponible)));

const isOpenBackorder = (item) => Boolean(item?.vender_sin_stock) && !isPartnerLimitedStock(item);

const getStockStatus = (item) => {
  const available = getAvailableStock(item);
  const minimum = getStockMinimum(item);

  if (available <= 0) return 'sin_stock';
  if (minimum > 0 && available <= minimum && !isPartnerLimitedStock(item)) return 'stock_bajo';
  return 'normal';
};

const makeDraftFromProduct = (product) => {
  const basePrice = numberValue(product.precio);
  const availableStock = getAvailableStock(product);

  const options = getOptions(product).map((option) => {
    const optionPrice = numberValue(option.precio_adicional);

    return {
      ...option,
      seleccionado: Boolean(option.es_obligatorio),
      valor_texto: option.tipo_campo === 'color' ? '#000000' : '',
      observacion: '',
      archivo_file: null,
      precio_adicional: optionPrice,
      precio_adicional_original: optionPrice,
    };
  });

  return calculateItem({
    uid: `${product.variante_id}-${Date.now()}`,
    variante_id: product.variante_id,
    producto_id: product.producto_id,
    codigoproducto: product.codigoproducto,
    nombre_producto: product.nombre_producto,
    nombre_variante: product.nombre_variante,
    descripcion_corta: product.descripcion_corta,
    imagen_url: product.imagen_url,
    categoria_nombre: product.categoria_nombre,
    atributos_resumen: product.atributos_resumen,
    atributos: getAttributes(product),
    etiqueta_medida: product.etiqueta_medida,
    material_variante: product.material_variante,
    color_principal: product.color_principal,
    acabado: product.acabado,
    mostrar_precio: Boolean(product.mostrar_precio),
    requiere_cotizacion: Boolean(product.requiere_cotizacion),
    es_personalizable: Boolean(product.es_personalizable),
    vender_sin_stock: Boolean(product.vender_sin_stock),
    tipo_stock_operativo: product.tipo_stock_operativo || product.disponibilidad_tipo || 'inventario_aliqora',
    socio_comercial_id: product.socio_comercial_id || null,
    stock_externo_disponible: numberValue(product.stock_externo_disponible),
    stock_externo_reservado: numberValue(product.stock_externo_reservado),
    stock_externo_restante: numberValue(product.stock_externo_restante),
    permite_bajo_pedido_abierto: Boolean(product.permite_bajo_pedido_abierto),
    stock_total: availableStock,
    stock_actual: availableStock,
    stock_disponible: availableStock,
    stock_minimo: getStockMinimum(product),
    costo_unitario: numberValue(product.costo),
    cantidad: 1,
    tipo_item: 'estandar',
    precio_lista: basePrice,
    precio_base_unitario: basePrice,
    precio_personalizacion_unitario: 0,
    costo_unico_personalizacion: 0,
    descuento_linea: 0,
    motivo_precio_manual: '',
    observacion_produccion: '',
    requiere_abastecimiento: false,
    personalizaciones: options,
  });
};

function calculateItem(item) {
  const selectedOptions = (item.personalizaciones || []).filter((option) => option.seleccionado);
  const personalizationPrice = item.tipo_item === 'personalizado'
    ? selectedOptions.reduce((acc, option) => acc + numberValue(option.precio_adicional), 0)
    : 0;
  const quantity = positiveQuantity(item.cantidad);
  const base = numberValue(item.precio_base_unitario);
  const uniqueCost = item.tipo_item === 'personalizado' ? numberValue(item.costo_unico_personalizacion) : 0;
  const discount = numberValue(item.descuento_linea);
  const lineTotal = Math.max(((base + personalizationPrice) * quantity) + uniqueCost - discount, 0);
  const insufficientStock = quantity > getAvailableStock(item);

  return {
    ...item,
    cantidad: quantity,
    precio_personalizacion_unitario: personalizationPrice,
    precio_unitario: base + personalizationPrice,
    total_linea: lineTotal,
    requiere_abastecimiento: insufficientStock && isOpenBackorder(item),
  };
}

const getProductPriceLabel = (product) => {
  if (!product?.mostrar_precio || product?.requiere_cotizacion) return 'Precio por acordar';
  return formatCurrency(product.precio);
};

const ProductThumb = ({ src, alt, size = 72 }) => (
  <Box
    component="img"
    src={src || '/vite.svg'}
    alt={alt || 'Producto'}
    onError={(event) => {
      event.currentTarget.onerror = null;
      event.currentTarget.src = '/vite.svg';
    }}
    sx={(theme) => ({
      width: size,
      height: size,
      borderRadius: theme.palette.custom.radius.xs,
      objectFit: 'cover',
      bgcolor: theme.palette.action.hover,
      border: `1px solid ${theme.palette.divider}`,
      flexShrink: 0,
    })}
  />
);

const ProductResultCard = ({ product, selected, onSelect }) => {
  const stockStatus = getStockStatus(product);
  const availableStock = getAvailableStock(product);
  const variantLabel = product.nombre_variante || product.etiqueta_medida || product.codigoproducto || 'Variante principal';
  const detailLine = [
    product.codigoproducto && `Cod. ${product.codigoproducto}`,
    product.etiqueta_medida,
    product.material_variante,
    product.color_principal,
    product.acabado,
  ].filter(Boolean).join(' · ');

  const stockChipColor = stockStatus === 'sin_stock'
    ? 'error'
    : stockStatus === 'stock_bajo'
      ? 'warning'
      : 'success';

  return (
    <Card
      variant="outlined"
      sx={(theme) => {
        const m = theme.palette.custom.semantic.storeMarketing;

        return {
          boxShadow: 'none',
          borderRadius: theme.palette.custom.radius.xs,
          backgroundImage: 'none',
          bgcolor: selected ? alpha(m.lightAccent, 0.08) : m.lightCardBg,
          borderColor: selected ? m.lightAccent : m.lightCardBorder,
          minHeight: 128,
          transition: `border-color ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}, background-color ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}`,
          '&:hover': {
            borderColor: m.lightAccent,
            bgcolor: selected ? alpha(m.lightAccent, 0.1) : alpha(m.lightAccent, 0.04),
          },
        };
      }}
    >
      <CardActionArea onClick={onSelect} sx={{ alignItems: 'stretch' }}>
        <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
            <ProductThumb src={product.imagen_url} alt={product.nombre_producto} />

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={(theme) => ({
                      color: theme.palette.custom.semantic.storeMarketing.lightText,
                      fontWeight: 900,
                      lineHeight: 1.2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    })}
                  >
                    {product.nombre_producto}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      mt: 0.25,
                      color: theme.palette.custom.semantic.storeMarketing.lightMuted,
                      fontWeight: 700,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    })}
                  >
                    {variantLabel}
                  </Typography>
                </Box>

                {selected && <Chip size="small" color="primary" label="Elegido" />}
              </Stack>

              {detailLine && (
                <Typography
                  variant="caption"
                  sx={(theme) => ({
                    display: '-webkit-box',
                    mt: 0.5,
                    color: theme.palette.text.secondary,
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  })}
                >
                  {detailLine}
                </Typography>
              )}

              {product.categoria_nombre && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                  Categoría: {product.categoria_nombre}
                </Typography>
              )}

              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                <Chip
                  size="small"
                  icon={<LocalOfferOutlinedIcon />}
                  label={getProductPriceLabel(product)}
                  color={product.requiere_cotizacion || !product.mostrar_precio ? 'warning' : 'default'}
                  variant={product.requiere_cotizacion || !product.mostrar_precio ? 'filled' : 'outlined'}
                />
                <Chip
                  size="small"
                  icon={<Inventory2OutlinedIcon />}
                  label={stockStatus === 'sin_stock' ? 'Sin disponibilidad' : `Disponible ${availableStock}`}
                  color={stockChipColor}
                  variant={stockStatus === 'normal' ? 'outlined' : 'filled'}
                />
                {isPartnerLimitedStock(product) && <Chip size="small" color="info" label="Socio comercial" variant="outlined" />}
                {isOpenBackorder(product) && <Chip size="small" color="info" label="Bajo pedido" variant="outlined" />}
                {product.es_personalizable && <Chip size="small" color="secondary" label="Personalizable" variant="outlined" />}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const hasContact = (cliente) => Boolean(cliente.nombre_cliente?.trim()) && Boolean(cliente.telefono_cliente?.trim() || cliente.correo_cliente?.trim());

const requiresContactForSale = ({ operationType, items, pago, entrega }) => {
  if (operationType === 'cotizacion_manual') return true;
  if (pago.estadoPago !== 'pagado') return true;
  if (contactDeliveryTypes.includes(entrega.tipo_entrega)) return true;
  return items.some((item) => item.tipo_item === 'personalizado' || item.requiere_abastecimiento || item.requiere_cotizacion || isPartnerLimitedStock(item));
};

const validateCustomizationDraft = (item) => {
  if (item.tipo_item !== 'personalizado') return null;

  const selected = (item.personalizaciones || []).filter((option) => option.seleccionado);
  if (!selected.length) return 'Selecciona al menos una opción de personalización.';

  const missingRequired = selected.find((option) => {
    const needsValue = ['texto', 'textarea', 'select', 'color', 'numero', 'boolean'].includes(option.tipo_campo);
    const needsFile = option.tipo_campo === 'archivo' || option.archivo_obligatorio;
    return (option.es_obligatorio && needsValue && !String(option.valor_texto || '').trim())
      || (needsFile && !option.archivo_file && !option.archivo_url);
  });

  if (missingRequired) return `Completa la opción ${missingRequired.opcion_nombre || missingRequired.nombre}.`;
  return null;
};

const requiresPriceReason = (item, operationType) => {
  if (!item || operationType !== 'venta_directa') return false;

  const listPrice = numberValue(item.precio_lista);
  const basePrice = numberValue(item.precio_base_unitario);
  const basePriceChanged = listPrice > 0 && basePrice !== listPrice;
  const basePriceCreated = listPrice <= 0 && basePrice > 0;
  const forcedManualPrice = Boolean(item.requiere_cotizacion) || !item.mostrar_precio;
  const hasDiscount = numberValue(item.descuento_linea) > 0;

  return basePriceChanged || basePriceCreated || forcedManualPrice || hasDiscount;
};

const validateItemForOperation = (item, operationType) => {
  if (!item) return 'Selecciona un producto.';

  const customizationError = validateCustomizationDraft(item);
  if (customizationError) return customizationError;

  if (operationType === 'venta_directa') {
    if (numberValue(item.total_linea) <= 0) {
      return `Ingresa el precio de ${item.nombre_producto}.`;
    }

    if (requiresPriceReason(item, operationType) && !item.motivo_precio_manual?.trim()) {
      return `Indica el motivo del precio acordado para ${item.nombre_producto}.`;
    }
  }

  if (numberValue(item.cantidad) > getAvailableStock(item) && !isOpenBackorder(item)) {
    return isPartnerLimitedStock(item)
      ? `Solo hay ${getAvailableStock(item)} unidad(es) disponibles para ${item.nombre_producto}.`
      : `La cantidad supera el stock disponible para ${item.nombre_producto}.`;
  }

  return null;
};

const getStockAlert = (item) => {
  if (!item) return null;

  const available = getAvailableStock(item);
  const minimum = getStockMinimum(item);
  const quantity = numberValue(item.cantidad);

  if (quantity > available && isPartnerLimitedStock(item)) {
    return {
      severity: 'error',
      message: `Máximo disponible: ${available} unidad(es).`,
    };
  }

  if (quantity > available && isOpenBackorder(item)) {
    return {
      severity: 'warning',
      message: 'Se atenderá bajo pedido.',
    };
  }

  if (quantity > available) {
    return {
      severity: 'error',
      message: 'La cantidad supera el stock disponible.',
    };
  }

  if (minimum > 0 && available > 0 && available <= minimum) {
    return {
      severity: 'warning',
      message: 'Este producto se encuentra con stock bajo.',
    };
  }

  if (minimum > 0 && available - quantity <= minimum) {
    return {
      severity: 'info',
      message: 'Después de esta venta el producto quedará cerca del stock mínimo.',
    };
  }

  return null;
};

const OptionValueField = ({ option, onChange }) => {
  if (option.tipo_campo === 'archivo') return null;

  if (option.tipo_campo === 'textarea') {
    return (
      <TextField
        fullWidth
        multiline
        minRows={2}
        label="Detalle"
        value={option.valor_texto || ''}
        onChange={(event) => onChange('valor_texto', event.target.value)}
      />
    );
  }

  if (option.tipo_campo === 'select') {
    const values = Array.isArray(option.opciones_json) ? option.opciones_json : [];
    return (
      <TextField
        fullWidth
        select
        label="Valor"
        value={option.valor_texto || ''}
        onChange={(event) => onChange('valor_texto', event.target.value)}
      >
        {values.map((value) => {
          const optionValue = typeof value === 'string' ? value : value.value || value.label || '';
          const optionLabel = typeof value === 'string' ? value : value.label || value.value || '';
          return (
            <MenuItem key={optionValue} value={optionValue}>
              {optionLabel}
            </MenuItem>
          );
        })}
      </TextField>
    );
  }

  if (option.tipo_campo === 'color') {
    return (
      <TextField
        fullWidth
        type="color"
        label="Color"
        value={option.valor_texto || '#000000'}
        onChange={(event) => onChange('valor_texto', event.target.value)}
      />
    );
  }

  if (option.tipo_campo === 'numero') {
    return (
      <TextField
        fullWidth
        type="number"
        label="Valor"
        value={option.valor_texto || ''}
        onChange={(event) => onChange('valor_texto', event.target.value)}
      />
    );
  }

  if (option.tipo_campo === 'boolean') {
    return (
      <TextField
        fullWidth
        select
        label="Valor"
        value={option.valor_texto || ''}
        onChange={(event) => onChange('valor_texto', event.target.value)}
      >
        <MenuItem value="si">Sí</MenuItem>
        <MenuItem value="no">No</MenuItem>
      </TextField>
    );
  }

  return (
    <TextField
      fullWidth
      label="Valor"
      value={option.valor_texto || ''}
      onChange={(event) => onChange('valor_texto', event.target.value)}
    />
  );
};

const ProductDetailSummary = ({ item }) => {
  const attrs = Array.isArray(item?.atributos) ? item.atributos : [];
  const characteristics = [
    item?.etiqueta_medida && ['Medida', item.etiqueta_medida],
    item?.material_variante && ['Material', item.material_variante],
    item?.color_principal && ['Color', item.color_principal],
    item?.acabado && ['Acabado', item.acabado],
  ].filter(Boolean);

  return (
    <Stack spacing={1.5}>
      <Box
        component="img"
        src={item.imagen_url || '/vite.svg'}
        alt={item.nombre_producto}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = '/vite.svg';
        }}
        sx={(theme) => ({
          width: '100%',
          height: 220,
          borderRadius: theme.palette.custom.radius.xs,
          objectFit: 'cover',
          bgcolor: theme.palette.action.hover,
          border: `1px solid ${theme.palette.divider}`,
        })}
      />

      <Box>
        <Typography variant="h6" fontWeight={900}>{item.nombre_producto}</Typography>
        <Typography variant="body2" color="text.secondary">
          {item.nombre_variante || item.codigoproducto || 'Variante principal'}
        </Typography>
        {item.descripcion_corta && (
          <Typography variant="body2" sx={{ mt: 1 }}>{item.descripcion_corta}</Typography>
        )}
      </Box>

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary">Código</Typography>
          <Typography fontWeight={800}>{item.codigoproducto || 'Sin código'}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary">Categoría</Typography>
          <Typography fontWeight={800}>{item.categoria_nombre || 'Sin categoría'}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary">Precio catálogo</Typography>
          <Typography fontWeight={800}>{item.mostrar_precio && !item.requiere_cotizacion ? formatCurrency(item.precio_lista) : 'Por acordar'}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="caption" color="text.secondary">Stock disponible</Typography>
          <Typography fontWeight={800}>{getAvailableStock(item)}</Typography>
        </Grid>
      </Grid>

      {!!characteristics.length && (
        <Box>
          <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 0.75 }}>Características</Typography>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            {characteristics.map(([label, value]) => (
              <Chip key={`${label}-${value}`} size="small" label={`${label}: ${value}`} />
            ))}
          </Stack>
        </Box>
      )}

      {!!attrs.length && (
        <Box>
          <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 0.75 }}>Atributos</Typography>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            {attrs.map((attr) => (
              <Chip
                key={`${attr.atributo_id}-${attr.atributo_valor_id}`}
                size="small"
                label={`${attr.atributo_nombre}: ${attr.valor}`}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

export const ManualSalesPage = () => {
  const [operationType, setOperationType] = useState('venta_directa');
  const [search, setSearch] = useState('');
  const [catalogPage, setCatalogPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [cliente, setCliente] = useState(initialClient);
  const [entrega, setEntrega] = useState(initialDelivery);
  const [pago, setPago] = useState(initialPayment);
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [draftItem, setDraftItem] = useState(null);
  const [notasInternas, setNotasInternas] = useState('');
  const [notice, setNotice] = useState(null);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCatalogPage(1);
  }, [debouncedSearch]);

  const {
    products,
    pagination,
    loading,
    fetching,
    error: searchError,
  } = useManualSaleProducts({
    search: debouncedSearch,
    pageNumber: catalogPage,
    pageSize: CATALOG_PAGE_SIZE,
  });
  const { createSale, createQuote, creating, error: saleError } = useManualSale();

  const total = useMemo(() => items.reduce((acc, item) => acc + numberValue(item.total_linea), 0), [items]);
  const deliveryOptions = operationType === 'venta_directa'
    ? directSaleDeliveryOptions
    : quoteDeliveryOptions;
  const needsContact = requiresContactForSale({ operationType, items, pago, entrega });
  const needsAddress = deliveryTypes.includes(entrega.tipo_entrega);
  const draftRequiresPriceReason = requiresPriceReason(draftItem, operationType);
  const draftValidationMessage = draftItem ? validateItemForOperation(draftItem, operationType) : null;
  const stockAlert = getStockAlert(draftItem);

  const handleClientChange = (event) => {
    const { name, value } = event.target;
    setCliente((current) => ({ ...current, [name]: value }));
  };

  const handleDeliveryChange = (event) => {
    const { name, value } = event.target;
    setEntrega((current) => ({ ...current, [name]: value }));
  };

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;
    setPago((current) => ({ ...current, [name]: value }));
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setDraftItem(makeDraftFromProduct(product));
  };

  const updateDraft = (field, value) => {
    setDraftItem((current) => calculateItem({ ...current, [field]: value }));
  };

  const updateCustomization = (index, field, value) => {
    setDraftItem((current) => {
      const personalizaciones = (current.personalizaciones || []).map((option, optionIndex) => {
        if (optionIndex !== index) return option;
        return { ...option, [field]: value };
      });
      return calculateItem({ ...current, personalizaciones });
    });
  };

  const handleAddItem = () => {
    if (!draftItem) return;

    const currentQuantity = items
      .filter((item) => item.variante_id === draftItem.variante_id)
      .reduce((acc, item) => acc + numberValue(item.cantidad), 0);
    const totalQuantity = currentQuantity + numberValue(draftItem.cantidad);
    const draftForValidation = calculateItem({ ...draftItem, cantidad: totalQuantity });
    const itemError = validateItemForOperation(draftForValidation, operationType);

    if (itemError) {
      setNotice({ severity: 'warning', message: itemError });
      return;
    }

    setItems((current) => [...current, { ...draftItem, uid: `${draftItem.variante_id}-${Date.now()}` }]);
    setDraftItem(makeDraftFromProduct(selectedProduct || draftItem));
  };

  const handleEditItem = (uid) => {
    const item = items.find((currentItem) => currentItem.uid === uid);
    if (!item) return;

    setItems((current) => current.filter((currentItem) => currentItem.uid !== uid));
    setSelectedProduct(item);
    setDraftItem(calculateItem(item));
    setNotice({ severity: 'info', message: 'Producto listo para editar.' });
  };

  const requestRemoveItem = (item) => {
    setItemToRemove(item);
  };

  const handleConfirmRemoveItem = () => {
    if (!itemToRemove?.uid) return;

    setItems((current) => current.filter((item) => item.uid !== itemToRemove.uid));
    setItemToRemove(null);
  };

  const validateSubmit = () => {
    if (!items.length) return 'Agrega al menos un producto.';

    if (needsContact && !hasContact(cliente)) {
      return 'Registra el nombre del cliente y un teléfono o correo.';
    }

    if (needsAddress) {
      const requiredAddress = ['nombre_receptor', 'telefono_receptor', 'departamento', 'provincia', 'distrito', 'direccion'];
      const missingAddress = requiredAddress.some((field) => !String(entrega[field] || '').trim());
      if (missingAddress) return 'Completa los datos de entrega.';
    }

    const groupedItems = items.reduce((acc, item) => {
      const current = acc.get(item.variante_id) || { ...item, cantidad: 0 };
      acc.set(item.variante_id, { ...current, cantidad: numberValue(current.cantidad) + numberValue(item.cantidad) });
      return acc;
    }, new Map());

    const invalidItem = Array.from(groupedItems.values()).find((item) => validateItemForOperation(calculateItem(item), operationType));
    if (invalidItem) return validateItemForOperation(calculateItem(invalidItem), operationType);

    if (operationType === 'venta_directa' && pago.estadoPago === 'validando' && !pago.comprobanteFile) {
      return 'Adjunta el comprobante recibido.';
    }

    return null;
  };

  const resetForm = () => {
    setCliente(initialClient);
    setEntrega(initialDelivery);
    setPago(initialPayment);
    setItems([]);
    setSelectedProduct(null);
    setDraftItem(null);
    setNotasInternas('');
  };

  const handleSubmit = async () => {
    const validationMessage = validateSubmit();
    if (validationMessage) {
      setNotice({ severity: 'warning', message: validationMessage });
      return;
    }

    const payload = { cliente, entrega, items, pago, notasInternas };
    const result = operationType === 'venta_directa'
      ? await createSale(payload)
      : await createQuote(payload);

    setNotice({
      severity: 'success',
      message: operationType === 'venta_directa'
        ? `Venta manual registrada. Pedido: ${result?.numero_pedido || result?.pedido_id || 'registrado'}.`
        : `Cotización asistida creada: ${result?.numero_cotizacion || result?.cotizacion_id || 'registrada'}.`,
    });
    resetForm();
  };

  return (
    <Box>
      <PageHeader
        title="Venta manual"
        description="Registra ventas directas o cotizaciones asistidas por vendedor."
      />

      <Stack spacing={2.5}>
        <ErrorMessage message={searchError || saleError} />
        {notice && (
          <Alert severity={notice.severity} onClose={() => setNotice(null)}>
            {notice.message}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 4, xl: 4 }}>
            <Card
              sx={(theme) => ({
                height: '100%',
                borderRadius: theme.palette.custom.radius.xs,
                backgroundImage: 'none',
              })}
            >
              <CardContent sx={{ height: '100%', '&:last-child': { pb: 2 } }}>
                <Stack spacing={2} sx={{ height: '100%' }}>
                  <Box>
                    <Typography variant="h6" fontWeight={900}>Catálogo</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Selecciona una variante exacta para vender.
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Buscar producto"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    helperText={
                      fetching
                        ? 'Buscando productos.'
                        : 'Busca por nombre, código, variante, medida, material o categoría.'
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchOutlinedIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: fetching ? (
                          <InputAdornment position="end">
                            <CircularProgress size={18} />
                          </InputAdornment>
                        ) : null,
                      },
                    }}
                  />

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      minHeight: 28,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {pagination.totalCount > 0
                        ? `${pagination.totalCount} variante(s) encontrada(s)`
                        : 'Sin resultados para mostrar'}
                    </Typography>

                    {pagination.totalPages > 1 && (
                      <Typography variant="caption" color="text.secondary">
                        Página {pagination.pageNumber} de {pagination.totalPages}
                      </Typography>
                    )}
                  </Stack>

                  <Stack
                    spacing={1.25}
                    sx={{
                      // No usamos una altura fija en desktop porque con 4 tarjetas
                      // el listado se veía cortado y comprimido. La página completa
                      // puede desplazarse de forma natural.
                      maxHeight: 'none',
                      minHeight: 0,
                      overflow: 'visible',
                      pr: 0,
                    }}
                  >
                    {products.map((product) => (
                      <ProductResultCard
                        key={product.variante_id}
                        product={product}
                        selected={selectedProduct?.variante_id === product.variante_id}
                        onSelect={() => handleSelectProduct(product)}
                      />
                    ))}

                    {!loading && !products.length && (
                      <Alert severity="info">
                        No se encontraron variantes. Prueba con nombre, código, medida o categoría.
                      </Alert>
                    )}
                  </Stack>

                  {pagination.totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
                      <Pagination
                        page={catalogPage}
                        count={pagination.totalPages}
                        onChange={(_, page) => setCatalogPage(page)}
                        color="primary"
                        size="small"
                        siblingCount={0}
                        boundaryCount={1}
                        disabled={fetching}
                      />
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4, xl: 4 }}>
            <Card
              sx={(theme) => ({
                height: '100%',
                borderRadius: theme.palette.custom.radius.xs,
                backgroundImage: 'none',
              })}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={900}>Producto seleccionado</Typography>

                  {!draftItem ? (
                    <Typography variant="body2" color="text.secondary">
                      Selecciona un producto del catálogo.
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      <ProductDetailSummary item={draftItem} />

                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        <Chip label={`Disponible: ${getAvailableStock(draftItem)}`} color={getStockStatus(draftItem) === 'stock_bajo' ? 'warning' : 'default'} />
                        {draftItem.stock_minimo > 0 && !isPartnerLimitedStock(draftItem) && <Chip label={`Stock mínimo: ${draftItem.stock_minimo}`} />}
                        {isPartnerLimitedStock(draftItem) && <Chip color="info" label="Producto de socio" />}
                        {isOpenBackorder(draftItem) && <Chip color="info" label="Permite bajo pedido" />}
                        {draftItem.es_personalizable && <Chip color="secondary" label="Permite personalización" />}
                        {draftItem.requiere_cotizacion && <Chip color="warning" label="Precio acordado" />}
                      </Stack>

                      {stockAlert && (
                        <Alert severity={stockAlert.severity}>{stockAlert.message}</Alert>
                      )}

                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Cantidad"
                            value={draftItem.cantidad}
                            onChange={(event) => updateDraft('cantidad', positiveQuantity(event.target.value))}
                            slotProps={{ htmlInput: { min: 1 } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            select
                            label="Tipo de producto"
                            value={draftItem.tipo_item}
                            onChange={(event) => updateDraft('tipo_item', event.target.value)}
                          >
                            <MenuItem value="estandar">Estándar</MenuItem>
                            {draftItem.es_personalizable && <MenuItem value="personalizado">Personalizado</MenuItem>}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Precio base unitario"
                            value={draftItem.precio_base_unitario}
                            onChange={(event) => updateDraft('precio_base_unitario', numberValue(event.target.value))}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Personalización unitaria"
                            value={formatCurrency(draftItem.precio_personalizacion_unitario)}
                            disabled
                          />
                        </Grid>
                        {draftItem.tipo_item === 'personalizado' && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Costo único"
                              value={draftItem.costo_unico_personalizacion}
                              onChange={(event) => updateDraft('costo_unico_personalizacion', numberValue(event.target.value))}
                            />
                          </Grid>
                        )}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Descuento"
                            value={draftItem.descuento_linea}
                            onChange={(event) => updateDraft('descuento_linea', numberValue(event.target.value))}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            required={draftRequiresPriceReason}
                            fullWidth
                            label="Motivo del precio acordado"
                            value={draftItem.motivo_precio_manual}
                            error={draftRequiresPriceReason && !draftItem.motivo_precio_manual?.trim()}
                            onChange={(event) => updateDraft('motivo_precio_manual', event.target.value)}
                            helperText={draftRequiresPriceReason ? 'Obligatorio para precio acordado o descuento.' : 'Opcional.'}
                          />
                        </Grid>
                      </Grid>

                      {draftItem.tipo_item === 'personalizado' && (
                        <Stack spacing={1.5}>
                          <Typography fontWeight={900}>Personalización</Typography>
                          {draftItem.personalizaciones.length ? draftItem.personalizaciones.map((option, index) => (
                            <Card key={option.id || option.opcion_id || option.codigo} variant="outlined" sx={{ boxShadow: 'none' }}>
                              <CardContent>
                                <Stack spacing={1.5}>
                                  <FormControlLabel
                                    control={(
                                      <Checkbox
                                        checked={Boolean(option.seleccionado)}
                                        disabled={Boolean(option.es_obligatorio)}
                                        onChange={(event) => updateCustomization(index, 'seleccionado', event.target.checked)}
                                      />
                                    )}
                                    label={option.opcion_nombre || option.nombre}
                                  />

                                  {option.texto_ayuda && (
                                    <Typography variant="body2" color="text.secondary">{option.texto_ayuda}</Typography>
                                  )}

                                  {option.seleccionado && (
                                    <Grid container spacing={1.5}>
                                      <Grid size={{ xs: 12 }}>
                                        <OptionValueField
                                          option={option}
                                          onChange={(field, value) => updateCustomization(index, field, value)}
                                        />
                                      </Grid>

                                      {(option.acepta_archivo || option.permite_archivo || option.tipo_campo === 'archivo') && (
                                        <Grid size={{ xs: 12 }}>
                                          <FileUploadField
                                            label="Archivo de referencia"
                                            accept="image/*,.pdf,.doc,.docx"
                                            value={option.archivo_file}
                                            height={150}
                                            helperText="Adjunta logo, diseño o documento."
                                            onChange={(file) => updateCustomization(index, 'archivo_file', file)}
                                          />
                                        </Grid>
                                      )}

                                      <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                          fullWidth
                                          type="number"
                                          label="Costo unitario"
                                          value={option.precio_adicional || 0}
                                          onChange={(event) => updateCustomization(index, 'precio_adicional', numberValue(event.target.value))}
                                        />
                                      </Grid>
                                      <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                          fullWidth
                                          label="Observación"
                                          value={option.observacion || ''}
                                          onChange={(event) => updateCustomization(index, 'observacion', event.target.value)}
                                        />
                                      </Grid>
                                    </Grid>
                                  )}
                                </Stack>
                              </CardContent>
                            </Card>
                          )) : (
                            <Alert severity="warning">Este producto no tiene opciones de personalización configuradas.</Alert>
                          )}
                        </Stack>
                      )}

                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="Instrucciones para atención"
                        value={draftItem.observacion_produccion}
                        onChange={(event) => updateDraft('observacion_produccion', event.target.value)}
                      />

                      <Divider />
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography fontWeight={800}>Subtotal del producto</Typography>
                        <Typography fontWeight={900}>{formatCurrency(draftItem.total_linea)}</Typography>
                      </Stack>

                      {draftValidationMessage && (
                        <Alert severity="warning">{draftValidationMessage}</Alert>
                      )}

                      <Button
                        variant="contained"
                        startIcon={<AddShoppingCartOutlinedIcon />}
                        onClick={handleAddItem}
                        disabled={Boolean(draftValidationMessage)}
                      >
                        Agregar a la operación
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4, xl: 4 }}>
            <Card
              sx={(theme) => ({
                position: { lg: 'sticky' },
                top: 96,
                borderRadius: theme.palette.custom.radius.xs,
                backgroundImage: 'none',
              })}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={900}>Operación</Typography>

                  <TextField
                    fullWidth
                    select
                    label="Tipo de operación"
                    value={operationType}
                    onChange={(event) => {
                      const nextOperationType = event.target.value;
                      setOperationType(nextOperationType);

                      if (nextOperationType === 'venta_directa' && entrega.tipo_entrega === 'por_coordinar') {
                        setEntrega((current) => ({ ...current, tipo_entrega: 'recojo' }));
                      }

                      const invalidItem = items.find((item) => validateItemForOperation(item, nextOperationType));
                      if (invalidItem) {
                        setNotice({
                          severity: 'warning',
                          message: `${validateItemForOperation(invalidItem, nextOperationType)} Edita el producto para continuar.`,
                        });
                      }
                    }}
                  >
                    <MenuItem value="venta_directa">Registrar venta directa</MenuItem>
                    <MenuItem value="cotizacion_manual">Crear cotización asistida</MenuItem>
                  </TextField>

                  <Divider />
                  <Typography fontWeight={900}>Cliente</Typography>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth select label="Tipo de cliente" name="cliente_tipo" value={cliente.cliente_tipo} onChange={handleClientChange}>
                        <MenuItem value="mostrador">Cliente mostrador</MenuItem>
                        <MenuItem value="externo">Cliente externo</MenuItem>
                        <MenuItem value="registrado">Cliente registrado</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth select label="Canal" name="canal_atencion" value={cliente.canal_atencion} onChange={handleClientChange}>
                        <MenuItem value="presencial">Presencial</MenuItem>
                        <MenuItem value="whatsapp">WhatsApp</MenuItem>
                        <MenuItem value="telefono">Teléfono</MenuItem>
                        <MenuItem value="correo">Correo</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField fullWidth required={needsContact} label="Nombre cliente" name="nombre_cliente" value={cliente.nombre_cliente} onChange={handleClientChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth required={needsContact && !cliente.correo_cliente} label="Teléfono" name="telefono_cliente" value={cliente.telefono_cliente} onChange={handleClientChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth required={needsContact && !cliente.telefono_cliente} label="Correo" name="correo_cliente" type="email" value={cliente.correo_cliente} onChange={handleClientChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Documento" name="documento_cliente" value={cliente.documento_cliente} onChange={handleClientChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Empresa" name="empresa_cliente" value={cliente.empresa_cliente} onChange={handleClientChange} />
                    </Grid>
                  </Grid>

                  <Divider />
                  <Typography fontWeight={900}>Entrega</Typography>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12 }}>
                      <TextField fullWidth select label="Tipo de entrega" name="tipo_entrega" value={entrega.tipo_entrega} onChange={handleDeliveryChange}>
                        {deliveryOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    {operationType === 'cotizacion_manual' && entrega.tipo_entrega === 'por_coordinar' && (
                      <Grid size={{ xs: 12 }}>
                        <Alert severity="info">Define la entrega al convertir la cotización.</Alert>
                      </Grid>
                    )}
                    {needsAddress && (
                      <>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth required label="Receptor" name="nombre_receptor" value={entrega.nombre_receptor} onChange={handleDeliveryChange} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth required label="Teléfono receptor" name="telefono_receptor" value={entrega.telefono_receptor} onChange={handleDeliveryChange} /></Grid>
                        <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth required label="Departamento" name="departamento" value={entrega.departamento} onChange={handleDeliveryChange} /></Grid>
                        <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth required label="Provincia" name="provincia" value={entrega.provincia} onChange={handleDeliveryChange} /></Grid>
                        <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth required label="Distrito" name="distrito" value={entrega.distrito} onChange={handleDeliveryChange} /></Grid>
                        <Grid size={{ xs: 12 }}><TextField fullWidth required label="Dirección" name="direccion" value={entrega.direccion} onChange={handleDeliveryChange} /></Grid>
                        <Grid size={{ xs: 12 }}><TextField fullWidth label="Referencia" name="referencia" value={entrega.referencia} onChange={handleDeliveryChange} /></Grid>
                      </>
                    )}
                  </Grid>

                  {operationType === 'venta_directa' && (
                    <>
                      <Divider />
                      <Typography fontWeight={900}>Pago</Typography>
                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField fullWidth select label="Método" name="metodoPago" value={pago.metodoPago} onChange={handlePaymentChange}>
                            <MenuItem value="efectivo">Efectivo</MenuItem>
                            <MenuItem value="pos">POS / tarjeta</MenuItem>
                            <MenuItem value="yape_plin">Yape / Plin</MenuItem>
                            <MenuItem value="transferencia">Transferencia</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField fullWidth select label="Estado" name="estadoPago" value={pago.estadoPago} onChange={handlePaymentChange}>
                            <MenuItem value="pagado">Pagado</MenuItem>
                            <MenuItem value="validando">En validación</MenuItem>
                            <MenuItem value="pendiente">Pendiente</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField fullWidth label="Referencia de pago" name="referenciaTransaccion" value={pago.referenciaTransaccion} onChange={handlePaymentChange} />
                        </Grid>
                        {pago.estadoPago === 'validando' && (
                          <Grid size={{ xs: 12 }}>
                            <FileUploadField
                              label="Comprobante recibido"
                              accept="image/*,.pdf"
                              value={pago.comprobanteFile}
                              height={150}
                              helperText="Adjunta el comprobante del cliente."
                              onChange={(file) => setPago((current) => ({ ...current, comprobanteFile: file }))}
                            />
                          </Grid>
                        )}
                      </Grid>
                    </>
                  )}

                  <Divider />
                  <Typography fontWeight={900}>Productos agregados</Typography>
                  <Stack spacing={1.25}>
                    {items.map((item) => {
                      const itemValidation = validateItemForOperation(item, operationType);
                      return (
                        <Card key={item.uid} variant="outlined" sx={{ boxShadow: 'none' }}>
                          <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography fontWeight={900}>{item.nombre_producto}</Typography>
                                <Typography variant="body2" color="text.secondary">{item.cantidad} x {formatCurrency(item.precio_unitario)}</Typography>
                                <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
                                  {item.tipo_item === 'personalizado' && <Chip size="small" color="secondary" label="Personalizado" />}
                                  {isPartnerLimitedStock(item) && <Chip size="small" color="info" label="Socio" />}
                                  {item.requiere_abastecimiento && !isPartnerLimitedStock(item) && <Chip size="small" color="info" label="Bajo pedido" />}
                                  {itemValidation && <Chip size="small" color="warning" label="Revisar" />}
                                </Stack>
                                {itemValidation && (
                                  <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                                    {itemValidation}
                                  </Typography>
                                )}
                              </Box>
                              <Typography fontWeight={900}>{formatCurrency(item.total_linea)}</Typography>
                              <Tooltip title="Editar">
                                <IconButton color="primary" size="small" onClick={() => handleEditItem(item.uid)}>
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Quitar">
                                <IconButton color="error" size="small" onClick={() => requestRemoveItem(item)}>
                                  <DeleteOutlineOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {!items.length && <Typography variant="body2" color="text.secondary">Agrega productos desde el detalle.</Typography>}
                  </Stack>

                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Notas internas"
                    value={notasInternas}
                    onChange={(event) => setNotasInternas(event.target.value)}
                  />

                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={900}>Total</Typography>
                    <Typography variant="h6" fontWeight={900}>{formatCurrency(total)}</Typography>
                  </Stack>

                  <Button
                    variant="contained"
                    size="large"
                    disabled={creating || !items.length}
                    startIcon={operationType === 'venta_directa' ? <PointOfSaleOutlinedIcon /> : <RequestQuoteOutlinedIcon />}
                    onClick={handleSubmit}
                  >
                    {creating
                      ? 'Registrando...'
                      : operationType === 'venta_directa'
                        ? 'Registrar venta manual'
                        : 'Crear cotización asistida'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      <ConfirmDialog
        open={Boolean(itemToRemove)}
        action="delete"
        title="Quitar producto"
        message={itemToRemove
          ? `¿Deseas quitar ${itemToRemove.nombre_producto || 'este producto'} de la venta manual?`
          : '¿Deseas quitar este producto?'}
        confirmText="Quitar"
        onCancel={() => setItemToRemove(null)}
        onConfirm={handleConfirmRemoveItem}
      />
    </Box>
  );
};
