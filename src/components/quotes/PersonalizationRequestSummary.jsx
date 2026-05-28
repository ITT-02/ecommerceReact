// Resumen reutilizable de personalización solicitada.
// Muestra opciones, valores, observaciones, archivos y precios referenciales.

import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

import { formatCurrency } from '../../utils/formatters';

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';

const getJsonNumber = (value, key) => {
  const raw = value?.[key];
  const number = Number(raw || 0);
  return Number.isFinite(number) ? number : 0;
};

const normalizePersonalizations = ({ detail = {}, personalizations = [] }) => {
  const detailItems = Array.isArray(detail?.personalizaciones) ? detail.personalizaciones : [];
  const tableItems = Array.isArray(personalizations) ? personalizations : [];
  const merged = [...tableItems, ...detailItems];
  const seen = new Set();

  return merged.filter((item) => {
    const key = [
      item?.id,
      item?.opcion_id,
      item?.opcion_codigo,
      item?.valor_texto,
      item?.observacion,
      item?.archivo_url,
      item?.archivo_path,
    ].filter(Boolean).join('|');

    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getReferencePrices = (detail = {}) => {
  const base = Number(detail.precio_base_referencial || 0);
  const extra = Number(detail.precio_adicional_referencial || 0);
  const total = Number(detail.precio_total_referencial || 0) || base + extra;

  return { base, extra, total };
};

export const PersonalizationRequestSummary = ({
  title = 'Personalización solicitada',
  detail = {},
  personalizations = [],
  compact = false,
}) => {
  const items = normalizePersonalizations({ detail, personalizations });
  const { base, extra, total } = getReferencePrices(detail);
  const hasDetailText =
    hasValue(detail?.descripcion) ||
    hasValue(detail?.medidas_especiales) ||
    hasValue(detail?.colores_solicitados) ||
    hasValue(detail?.material_solicitado) ||
    hasValue(detail?.acabado_solicitado);

  const hasReferencePrice = base > 0 || extra > 0 || total > 0;
  const hasSummary = items.length > 0 || hasDetailText || hasReferencePrice;

  if (!hasSummary) {
    return (
      <Alert severity="info">
        No se registró personalización para este producto.
      </Alert>
    );
  }

  const Wrapper = compact ? Stack : Card;
  const wrapperProps = compact
    ? { spacing: 1.25 }
    : { variant: 'outlined', sx: { boxShadow: 'none' } };

  const content = (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, alignItems: 'center' }}>
        <Typography variant="subtitle2" fontWeight={900} sx={{ mr: 'auto' }}>
          {title}
        </Typography>
        {detail?.modo === 'personalizado' && <Chip size="small" label="Personalizado" color="secondary" variant="outlined" />}
        {detail?.requiere_cotizacion && <Chip size="small" label="Revisión requerida" color="warning" variant="outlined" />}
      </Stack>

      {hasReferencePrice && (
        <Alert severity="info">
          <Stack spacing={0.25}>
            {base > 0 && (
              <Typography variant="body2">
                Precio base referencial: <strong>{formatCurrency(base)}</strong>
              </Typography>
            )}
            {extra > 0 && (
              <Typography variant="body2">
                Adicional referencial por personalización: <strong>{formatCurrency(extra)}</strong>
              </Typography>
            )}
            {total > 0 && (
              <Typography variant="body2">
                Precio unitario referencial: <strong>{formatCurrency(total)}</strong>
              </Typography>
            )}
          </Stack>
        </Alert>
      )}

      {hasValue(detail?.descripcion) && (
        <Typography variant="body2" color="text.secondary">
          <strong>Resumen:</strong> {detail.descripcion}
        </Typography>
      )}

      {['medidas_especiales', 'colores_solicitados', 'material_solicitado', 'acabado_solicitado'].map((key) => (
        hasValue(detail?.[key]) ? (
          <Typography key={key} variant="body2" color="text.secondary">
            <strong>{key.replaceAll('_', ' ')}:</strong> {detail[key]}
          </Typography>
        ) : null
      ))}

      {items.length > 0 && (
        <Stack spacing={1}>
          {items.map((item, index) => {
            const extraPrice = Number(item.precio_adicional || 0) || getJsonNumber(item.valor_json, 'precio_adicional');
            const requiresQuote = Boolean(item.requiere_cotizacion ?? item.valor_json?.requiere_cotizacion);

            return (
              <Stack
                key={item.id || `${item.opcion_codigo}-${index}`}
                spacing={0.75}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 1.25,
                  bgcolor: 'background.paper',
                }}
              >
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight={900} sx={{ mr: 'auto' }}>
                    {item.opcion_nombre || item.opcion_codigo || 'Opción personalizada'}
                  </Typography>
                  {requiresQuote && <Chip size="small" label="Cotizar" color="warning" variant="outlined" />}
                  {extraPrice > 0 && <Chip size="small" label={`+ ${formatCurrency(extraPrice)}`} color="success" variant="outlined" />}
                </Stack>

                {hasValue(item.valor_texto) && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Valor:</strong> {item.valor_texto}
                  </Typography>
                )}

                {hasValue(item.observacion) && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Observación:</strong> {item.observacion}
                  </Typography>
                )}

                {hasValue(item.archivo_url) && (
                  <Button
                    component="a"
                    href={item.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    variant="outlined"
                    startIcon={<AttachFileOutlinedIcon />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Ver archivo adjunto
                  </Button>
                )}
              </Stack>
            );
          })}
        </Stack>
      )}

      {!compact && <Divider />}
    </Stack>
  );

  if (compact) {
    return <Wrapper {...wrapperProps}>{content}</Wrapper>;
  }

  return (
    <Wrapper {...wrapperProps}>
      <CardContent>{content}</CardContent>
    </Wrapper>
  );
};
