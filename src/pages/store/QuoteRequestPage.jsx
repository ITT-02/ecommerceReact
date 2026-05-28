// Formulario de solicitud de cotización o personalización para cliente.
// Regla principal: el producto estándar solo se cotiza si requiere cotización o no tiene precio visible.
// Si el cliente activa personalización, ventas recibe opciones, archivos y precio adicional referencial.

import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import { FileUploadField } from '../../components/common/Field/FileUploadField';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useAuth } from '../../hooks/auth/useAuth';
import { useStoreProductDetail } from '../../hooks/store/useStoreCatalog';
import { useCreateQuoteRequest } from '../../hooks/store/useStoreQuotes';
import { formatCurrency } from '../../utils/formatters';
import {
  getDefaultVariant,
  getVariantAttributes,
  getVariantLabel,
  isVariantActive,
} from '../../utils/store/variantSelection';

const getVariantSummary = (variant) => {
  const attributes = getVariantAttributes(variant);

  if (!attributes.length) return 'Sin atributos registrados';

  return attributes
    .map((item) => `${item.atributo_nombre || 'Atributo'}: ${item.valor}`)
    .join(' · ');
};

const getOptionFieldLabel = (option) => {
  if (option.tipo_campo === 'archivo') return 'Comentario sobre el archivo';
  if (option.tipo_campo === 'color') return 'Color solicitado';
  if (option.tipo_campo === 'numero') return 'Valor numérico';
  if (option.tipo_campo === 'boolean') return 'Respuesta';
  return 'Valor solicitado';
};

const optionRequiresText = (option) =>
  ['texto', 'textarea', 'select', 'color', 'numero', 'boolean'].includes(option.tipo_campo);

const hasCustomizationValue = (option, current = {}) => {
  return Boolean(
    option.es_obligatorio ||
      String(current.valor_texto || '').trim() ||
      String(current.observacion || '').trim() ||
      current.archivo_file
  );
};

export const QuoteRequestPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { product, loading, error } = useStoreProductDetail(slug);
  const { creating, error: createError, createQuote } = useCreateQuoteRequest();

  const initialVariantId = location.state?.variante_id || location.state?.variantId || '';
  const initialType = location.state?.tipoSolicitud || location.state?.tipo_solicitud || '';

  const [variantId, setVariantId] = useState(initialVariantId);
  const [wantsPersonalization, setWantsPersonalization] = useState(initialType === 'personalizacion');
  const [validationError, setValidationError] = useState('');
  const [customizationValues, setCustomizationValues] = useState({});
  const [formData, setFormData] = useState({
    cantidad: location.state?.cantidad || 1,
    nombreCliente:
      profile?.nombre_completo ||
      `${profile?.nombres || ''} ${profile?.apellidos || ''}`.trim(),
    telefonoCliente: profile?.telefono || '',
    correoCliente: '',
    mensajeCliente: '',
    notasItem: '',
  });

  const activeVariants = useMemo(() => {
    return (product?.variantes || []).filter(isVariantActive);
  }, [product?.variantes]);

  const selectedVariant = useMemo(() => {
    if (!activeVariants.length) return null;

    if (variantId) {
      return activeVariants.find((variant) => variant.id === variantId) || null;
    }

    return getDefaultVariant(activeVariants);
  }, [activeVariants, variantId]);

  const personalizationOptions = useMemo(() => {
    return (product?.personalizacion_opciones || [])
      .filter((option) => option.es_activo !== false)
      .sort((a, b) => Number(a.orden_visual || 0) - Number(b.orden_visual || 0));
  }, [product?.personalizacion_opciones]);

  const productAllowsPersonalization = Boolean(product?.es_personalizable) && personalizationOptions.length > 0;
  const isPersonalization = productAllowsPersonalization && wantsPersonalization;
  const selectedPrice = Number(selectedVariant?.precio ?? 0);
  const hasVisiblePrice = Boolean(product?.mostrar_precio) && selectedPrice > 0;
  const standardNeedsQuote = Boolean(product?.requiere_cotizacion) || !hasVisiblePrice;
  const standardCanBePurchased = Boolean(selectedVariant) && !standardNeedsQuote;
  const quantity = Math.max(1, Number(formData.cantidad) || 1);

  const selectedPersonalizations = useMemo(() => {
    if (!isPersonalization) return [];

    return personalizationOptions
      .map((option) => {
        const current = customizationValues[option.id] || {};

        return {
          opcion_id: option.id,
          opcion_codigo: option.codigo,
          opcion_nombre: option.nombre,
          tipo_campo: option.tipo_campo,
          valor_texto: current.valor_texto || '',
          valor_json: current.valor_json || {},
          observacion: current.observacion || '',
          archivo_file: current.archivo_file || null,
          es_obligatorio: option.es_obligatorio,
          archivo_obligatorio: option.archivo_obligatorio,
          requiere_cotizacion: option.requiere_cotizacion,
          precio_adicional: Number(option.precio_adicional || 0),
        };
      })
      .filter((item) => {
        const option = personalizationOptions.find((current) => current.id === item.opcion_id);
        return hasCustomizationValue(option || {}, customizationValues[item.opcion_id] || {});
      });
  }, [customizationValues, isPersonalization, personalizationOptions]);

  const personalizationRequiresQuote = selectedPersonalizations.some(
    (item) => item.requiere_cotizacion
  );

  const fixedPersonalizationExtra = selectedPersonalizations.reduce(
    (sum, item) => sum + Number(item.precio_adicional || 0),
    0
  );

  const referenceUnitTotal = hasVisiblePrice
    ? selectedPrice + fixedPersonalizationExtra
    : fixedPersonalizationExtra;

  const referenceLineTotal = referenceUnitTotal * quantity;
  const canSubmitQuote = Boolean(selectedVariant) && (isPersonalization || standardNeedsQuote);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValidationError('');

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCustomizationChange = (option, field, value) => {
    setValidationError('');
    setCustomizationValues((current) => ({
      ...current,
      [option.id]: {
        ...(current[option.id] || {}),
        opcion_id: option.id,
        opcion_codigo: option.codigo,
        opcion_nombre: option.nombre,
        tipo_campo: option.tipo_campo,
        [field]: value,
      },
    }));
  };

  const validatePersonalization = () => {
    if (!isPersonalization) return true;

    for (const option of personalizationOptions) {
      const current = customizationValues[option.id] || {};

      if (option.es_obligatorio && optionRequiresText(option) && !String(current.valor_texto || '').trim()) {
        setValidationError(`Completa la opción obligatoria: ${option.nombre}.`);
        return false;
      }

      if (option.archivo_obligatorio && !current.archivo_file) {
        setValidationError(`Adjunta el archivo obligatorio para: ${option.nombre}.`);
        return false;
      }
    }

    if (!selectedPersonalizations.length && !String(formData.notasItem || '').trim()) {
      setValidationError('Describe qué deseas personalizar o completa al menos una opción.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!product?.id || !selectedVariant?.id) return;

    if (!isPersonalization && standardCanBePurchased) {
      setValidationError('Este producto se compra desde el carrito.');
      return;
    }

    if (!validatePersonalization()) return;

    const detallePersonalizacion = isPersonalization
      ? {
          modo: 'personalizado',
          opciones: selectedPersonalizations.map((item) => item.opcion_nombre),
          requiere_cotizacion: personalizationRequiresQuote,
          precio_base_referencial: hasVisiblePrice ? selectedPrice : 0,
          precio_adicional_referencial: fixedPersonalizationExtra,
          precio_total_referencial: referenceUnitTotal,
          cantidad: quantity,
          total_linea_referencial: referenceLineTotal,
          descripcion: formData.notasItem,
          personalizaciones: selectedPersonalizations.map(({ archivo_file, ...item }) => item),
        }
      : {
          modo: 'estandar',
          precio_base_referencial: hasVisiblePrice ? selectedPrice : 0,
          cantidad: quantity,
        };

    const firstFile = selectedPersonalizations.find((item) => item.archivo_file)?.archivo_file || null;

    const quoteId = await createQuote({
      productoId: product.id,
      varianteId: selectedVariant.id,
      cantidad: quantity,
      nombreCliente: formData.nombreCliente,
      telefonoCliente: formData.telefonoCliente,
      correoCliente: formData.correoCliente,
      mensajeCliente: formData.mensajeCliente,
      notasItem: formData.notasItem,
      tipoSolicitud: isPersonalization ? 'personalizacion' : 'cotizacion',
      requierePersonalizacion: isPersonalization,
      detallePersonalizacion,
      referenciaDisenoFile: firstFile,
      personalizaciones: selectedPersonalizations,
    });

    navigate(`/mis-cotizaciones/${quoteId}`);
  };

  if (loading) return <LoadingScreen message="Cargando producto para cotizar..." />;

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <ErrorMessage message={error || 'Producto no encontrado.'} />
        <Button startIcon={<ArrowBackOutlinedIcon />} onClick={() => navigate('/catalogo')}>
          Volver al catálogo
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Button
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate(`/productos/${slug}`)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Volver al producto
        </Button>

        <Box>
          <Typography variant="h3" fontWeight={900}>
            {isPersonalization ? 'Solicitar personalización' : 'Solicitar cotización'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
            Completa la solicitud para recibir precio, vigencia y condiciones.
          </Typography>
        </Box>

        <ErrorMessage message={error || createError || validationError} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={900}>
                    Producto solicitado
                  </Typography>

                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {product.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.descripcion_corta || 'Producto de catálogo Aliqora'}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                    {product.requiere_cotizacion && (
                      <Chip size="small" label="Estándar requiere cotización" color="warning" variant="outlined" />
                    )}
                    {!product.requiere_cotizacion && hasVisiblePrice && (
                      <Chip size="small" label="Estándar con compra directa" color="success" variant="outlined" />
                    )}
                    {productAllowsPersonalization && (
                      <Chip size="small" label="Personalizable" color="primary" variant="outlined" />
                    )}
                    {isPersonalization && (
                      <Chip size="small" label="Con personalización" color="secondary" variant="outlined" />
                    )}
                  </Stack>

                  {productAllowsPersonalization ? (
                    <Alert severity="info">
                      Puedes solicitar este producto con o sin personalización.
                    </Alert>
                  ) : (
                    <Alert severity={standardNeedsQuote ? 'warning' : 'success'}>
                      {standardNeedsQuote
                        ? 'Este producto requiere cotización.'
                        : 'Este producto se compra desde el carrito.'}
                    </Alert>
                  )}

                  <TextField
                    select
                    label="Variante a solicitar"
                    value={selectedVariant?.id || ''}
                    onChange={(event) => setVariantId(event.target.value)}
                    fullWidth
                    required
                  >
                    {activeVariants.map((variant) => (
                      <MenuItem key={variant.id} value={variant.id}>
                        {getVariantLabel(variant)} · {variant.codigoproducto || 'Sin SKU'}
                      </MenuItem>
                    ))}
                  </TextField>

                  {selectedVariant && (
                    <Stack spacing={1}>
                      <Chip
                        label={selectedVariant.codigoproducto || 'Sin código'}
                        variant="outlined"
                        sx={{ alignSelf: 'flex-start' }}
                      />

                      <Typography variant="body2" color="text.secondary">
                        {getVariantSummary(selectedVariant)}
                      </Typography>

                      {hasVisiblePrice ? (
                        <Typography variant="body2" color="text.secondary">
                          Precio estándar: {formatCurrency(selectedVariant.precio)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="warning.main" fontWeight={700}>
                          Precio sujeto a cotización.
                        </Typography>
                      )}

                      {isPersonalization && fixedPersonalizationExtra > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Adicional referencial por personalización: {formatCurrency(fixedPersonalizationExtra)}
                        </Typography>
                      )}

                      {isPersonalization && referenceUnitTotal > 0 && (
                        <Alert severity="success">
                          Precio unitario referencial: <strong>{formatCurrency(referenceUnitTotal)}</strong>
                          <br />
                          Total referencial por {quantity} unidad(es): <strong>{formatCurrency(referenceLineTotal)}</strong>
                        </Alert>
                      )}
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Card component="form" onSubmit={handleSubmit}>
              <CardContent>
                <Stack spacing={2.25}>
                  <Typography variant="h6" fontWeight={900}>
                    Datos de solicitud
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        name="cantidad"
                        label="Cantidad requerida"
                        type="number"
                        value={formData.cantidad}
                        onChange={handleChange}
                        fullWidth
                        required
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        name="telefonoCliente"
                        label="Teléfono de contacto"
                        value={formData.telefonoCliente}
                        onChange={handleChange}
                        fullWidth
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        name="nombreCliente"
                        label="Nombre / empresa"
                        value={formData.nombreCliente}
                        onChange={handleChange}
                        fullWidth
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        name="correoCliente"
                        label="Correo de contacto"
                        type="email"
                        value={formData.correoCliente}
                        onChange={handleChange}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        name="mensajeCliente"
                        label="Mensaje general"
                        value={formData.mensajeCliente}
                        onChange={handleChange}
                        multiline
                        minRows={2}
                        fullWidth
                      />
                    </Grid>
                  </Grid>

                  {productAllowsPersonalization && (
                    <>
                      <Divider />
                      <Stack spacing={1.25}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={wantsPersonalization}
                              onChange={(event) => setWantsPersonalization(event.target.checked)}
                            />
                          }
                          label="Sí, quiero personalizar este producto"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Activa esta opción solo si deseas personalizar el producto.
                        </Typography>
                      </Stack>
                    </>
                  )}

                  {isPersonalization ? (
                    <Stack spacing={2}>
                      <Alert severity={personalizationRequiresQuote ? 'warning' : 'info'}>
                        {personalizationRequiresQuote
                          ? 'Revisaremos las opciones seleccionadas antes de confirmar el precio.'
                          : 'El adicional mostrado es referencial y será confirmado en la respuesta.'}
                      </Alert>

                      {personalizationOptions.map((option) => {
                        const current = customizationValues[option.id] || {};
                        const isFileEnabled = option.permite_archivo || option.acepta_archivo || option.tipo_campo === 'archivo';

                        return (
                          <Box
                            key={option.id}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                              p: 2,
                              bgcolor: 'background.paper',
                            }}
                          >
                            <Stack spacing={1.5}>
                              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                                <Typography variant="subtitle1" fontWeight={900} sx={{ mr: 'auto' }}>
                                  {option.nombre}
                                </Typography>
                                {option.es_obligatorio && <Chip size="small" label="Obligatorio" color="warning" variant="outlined" />}
                                {option.requiere_cotizacion && <Chip size="small" label="Requiere cotización" color="info" variant="outlined" />}
                                {Number(option.precio_adicional || 0) > 0 && (
                                  <Chip size="small" label={`+ ${formatCurrency(option.precio_adicional)}`} color="success" variant="outlined" />
                                )}
                              </Stack>

                              {option.texto_ayuda && (
                                <Typography variant="body2" color="text.secondary">
                                  {option.texto_ayuda}
                                </Typography>
                              )}

                              {option.tipo_campo === 'select' ? (
                                <TextField
                                  select
                                  label={getOptionFieldLabel(option)}
                                  value={current.valor_texto || ''}
                                  onChange={(event) => handleCustomizationChange(option, 'valor_texto', event.target.value)}
                                  fullWidth
                                  required={option.es_obligatorio}
                                >
                                  {(option.opciones_json || []).map((value) => (
                                    <MenuItem key={value} value={value}>{value}</MenuItem>
                                  ))}
                                </TextField>
                              ) : option.tipo_campo === 'boolean' ? (
                                <TextField
                                  select
                                  label={getOptionFieldLabel(option)}
                                  value={current.valor_texto || ''}
                                  onChange={(event) => handleCustomizationChange(option, 'valor_texto', event.target.value)}
                                  fullWidth
                                  required={option.es_obligatorio}
                                >
                                  <MenuItem value="sí">Sí</MenuItem>
                                  <MenuItem value="no">No</MenuItem>
                                </TextField>
                              ) : optionRequiresText(option) ? (
                                <TextField
                                  label={getOptionFieldLabel(option)}
                                  type={option.tipo_campo === 'numero' ? 'number' : 'text'}
                                  value={current.valor_texto || ''}
                                  onChange={(event) => handleCustomizationChange(option, 'valor_texto', event.target.value)}
                                  multiline={option.tipo_campo === 'textarea'}
                                  minRows={option.tipo_campo === 'textarea' ? 3 : undefined}
                                  fullWidth
                                  required={option.es_obligatorio}
                                />
                              ) : null}

                              {isFileEnabled && (
                                <FileUploadField
                                  label={option.archivo_obligatorio ? 'Archivo obligatorio' : 'Archivo de referencia'}
                                  accept="image/*,.pdf,application/pdf,.ai,.psd,.svg"
                                  value={current.archivo_file || null}
                                  height={150}
                                  helperText="Adjunta el archivo de referencia."
                                  onChange={(file) => handleCustomizationChange(option, 'archivo_file', file)}
                                />
                              )}

                              <TextField
                                label="Observación para esta opción"
                                value={current.observacion || ''}
                                onChange={(event) => handleCustomizationChange(option, 'observacion', event.target.value)}
                                multiline
                                minRows={2}
                                fullWidth
                              />
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  ) : standardCanBePurchased ? (
                    <Alert severity="warning">
                      Este producto se compra desde el carrito si no deseas personalizarlo.
                    </Alert>
                  ) : (
                    <Alert severity="info">
                      Revisaremos precio, stock y tiempo de preparación.
                    </Alert>
                  )}

                  <TextField
                    name="notasItem"
                    label={isPersonalization ? 'Resumen general de la personalización' : 'Notas del item'}
                    value={formData.notasItem}
                    onChange={handleChange}
                    multiline
                    minRows={3}
                    fullWidth
                    required={isPersonalization && selectedPersonalizations.length === 0}
                  />

                  {standardCanBePurchased && !isPersonalization && (
                    <Button
                      type="button"
                      variant="outlined"
                      size="large"
                      startIcon={<ShoppingCartOutlinedIcon />}
                      onClick={() => navigate(`/productos/${slug}`)}
                      fullWidth
                    >
Volver al producto
                    </Button>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={isPersonalization ? <AttachFileOutlinedIcon /> : <SendOutlinedIcon />}
                    disabled={creating || !canSubmitQuote}
                    fullWidth
                  >
                    {creating
                      ? 'Enviando...'
                      : isPersonalization
                        ? 'Enviar solicitud personalizada'
                        : 'Enviar solicitud'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};
