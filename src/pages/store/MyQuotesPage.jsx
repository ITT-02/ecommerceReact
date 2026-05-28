// Página cliente: listado de mis cotizaciones.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useMyQuotes } from '../../hooks/store/useStoreQuotes';
import { formatCurrency } from '../../utils/formatters';

const quoteStatusLabel = {
  solicitada: 'Solicitada',
  en_revision: 'En revisión',
  respondida: 'Respondida',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
  vencida: 'Vencida',
  convertida: 'Pedido generado',
};

const quoteStatusColor = {
  solicitada: 'info',
  en_revision: 'warning',
  respondida: 'success',
  aceptada: 'success',
  rechazada: 'error',
  cancelada: 'default',
  vencida: 'default',
  convertida: 'success',
};

const requestTypeLabel = {
  cotizacion: 'Cotización',
  personalizacion: 'Personalización',
};

const getQuoteFollowupMessage = (quote) => {
  if (quote.estado === 'respondida') return 'Lista para revisar y aceptar.';
  if (quote.estado === 'convertida') return quote.estado_pago && quote.estado_pago !== 'pagado'
    ? `Pedido generado · pago ${quote.estado_pago}.`
    : 'Pedido generado.';
  if (quote.estado === 'vencida') return 'Venció sin generar pedido.';
  if (quote.estado === 'cancelada') return 'Cancelada.';
  if (quote.estado === 'en_revision') return 'En revisión.';
  return 'Pendiente de revisión.';
};


export const MyQuotesPage = () => {
  const navigate = useNavigate();

  const [pageNumber, setPageNumber] = useState(1);
  const [estado, setEstado] = useState('');
  const [search, setSearch] = useState('');

  const { quotes, pagination, loading, fetching, error } = useMyQuotes({
    pageNumber,
    pageSize: 10,
    estado: estado || null,
    search,
  });

  if (loading) return <LoadingScreen message="Cargando cotizaciones..." />;

  const hasNewResponses = quotes.some((quote) => quote.tiene_respuesta_nueva);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3" fontWeight={900}>
            Mis cotizaciones
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
            Revisa tus solicitudes, respuestas, vencimientos y pedidos generados.
          </Typography>
        </Box>

        {hasNewResponses && (
          <Alert severity="success">
            Tienes una cotización lista para revisar.
          </Alert>
        )}

        <ErrorMessage message={error} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            label="Buscar"
            size="small"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPageNumber(1);
            }}
            sx={{ width: { xs: '100%', sm: 260 } }}
          />

          <TextField
            select
            label="Estado"
            size="small"
            value={estado}
            onChange={(event) => {
              setEstado(event.target.value);
              setPageNumber(1);
            }}
            sx={{ width: { xs: '100%', sm: 220 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            {Object.entries(quoteStatusLabel).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {quotes.length === 0 ? (
          <Card>
            <CardContent>
              <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', py: 5 }}>
                <RequestQuoteOutlinedIcon color="disabled" sx={{ fontSize: 44 }} />
                <Typography variant="h6" fontWeight={800}>
                  No tienes cotizaciones todavía
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cuando solicites una cotización o personalización desde el detalle de producto, aparecerá aquí.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/catalogo')}>
                  Ir al catálogo
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {quotes.map((quote) => {
              const firstItem = quote.items?.[0];

              return (
                <Grid key={quote.id} size={{ xs: 12 }}>
                  <Card
                    sx={{
                      border: quote.tiene_respuesta_nueva ? '1px solid' : undefined,
                      borderColor: quote.tiene_respuesta_nueva ? 'success.main' : undefined,
                    }}
                  >
                    <CardContent>
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 1 }}>
                            {quote.tiene_respuesta_nueva && (
                              <Chip size="small" label="Nueva respuesta" color="success" />
                            )}
                            <Chip
                              size="small"
                              label={quoteStatusLabel[quote.estado] || quote.estado}
                              color={quoteStatusColor[quote.estado] || 'default'}
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={requestTypeLabel[quote.tipo_solicitud] || 'Cotización'}
                              color={quote.tipo_solicitud === 'personalizacion' ? 'primary' : 'default'}
                              variant="outlined"
                            />
                            <Chip size="small" label={quote.numero_cotizacion} variant="outlined" />
                          </Stack>

                          <Typography variant="subtitle1" fontWeight={900}>
                            {firstItem?.nombre_producto || 'Cotización'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {firstItem?.nombre_variante || firstItem?.codigoproducto || 'Producto solicitado'}
                          </Typography>

                          {quote.mensaje_cliente && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              Solicitud: {quote.mensaje_cliente}
                            </Typography>
                          )}

                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Estado: {getQuoteFollowupMessage(quote)}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Solicitada: {quote.created_at ? new Date(quote.created_at).toLocaleDateString() : '-'}
                          </Typography>
                        </Box>

                        <Box sx={{ minWidth: { md: 180 } }}>
                          <Typography variant="caption" color="text.secondary">
                            Total cotizado
                          </Typography>
                          <Typography variant="h6" fontWeight={900}>
                            {Number(quote.total_estimado || 0) > 0
                              ? formatCurrency(quote.total_estimado)
                              : 'Pendiente'}
                          </Typography>
                        </Box>

                        <Button
                          variant={quote.tiene_respuesta_nueva ? 'contained' : 'outlined'}
                          startIcon={<VisibilityOutlinedIcon />}
                          onClick={() => navigate(`/mis-cotizaciones/${quote.id}`)}
                        >
                          {quote.tiene_respuesta_nueva ? 'Revisar respuesta' : 'Ver detalle'}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {pagination.totalPages > 1 && (
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', opacity: fetching ? 0.65 : 1 }}>
            <Button
              variant="outlined"
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPageNumber((page) => Math.max(page - 1, 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outlined"
              disabled={!pagination.hasNextPage}
              onClick={() => setPageNumber((page) => page + 1)}
            >
              Siguiente
            </Button>
          </Stack>
        )}
      </Stack>
    </Container>
  );
};
